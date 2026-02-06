"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  useState
} from 'react';
import gsap from 'gsap';

export interface CardSwapHandle {
  triggerSwap: () => void;
}

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  onCardClick?: (idx: number) => void;
  skewAmount?: number; // We will ignore this on mobile
  easing?: 'linear' | 'elastic';
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    // Added 'will-change-transform' and specific mobile optimizations in CSS
    className={`absolute top-1/2 left-1/2 rounded-3xl border border-white/10 bg-[#111] 
                [transform-style:preserve-3d] [backface-visibility:hidden] will-change-transform 
                ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
  scale: number; // Added scale for mobile optimization (fake depth)
}

const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children
}, ref) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- OPTIMIZATION: Config based on device ---
  const config = useMemo(() => {
    if (isMobile) {
      return {
        ease: 'power3.inOut', // Snappier, less CPU intensive than elastic
        durDrop: 0.6,
        durMove: 0.5,
        durReturn: 0.6,
        promoteOverlap: 0.2,
        returnDelay: 0.1,
        skew: 0 // No skew on mobile
      };
    }
    return easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
          skew: skewAmount
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
          skew: skewAmount
        };
  }, [isMobile, easing, skewAmount]);

  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);
  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Helper to calculate slots
  const getSlot = (i: number, total: number): Slot => {
    // Mobile: Tighter spacing, less Z-depth movement
    const dX = isMobile ? cardDistance * 0.5 : cardDistance;
    const dY = isMobile ? verticalDistance * 0.5 : verticalDistance;
    
    return {
      x: i * dX,
      y: -i * dY,
      z: -i * dX * (isMobile ? 0.5 : 1.5), // Reduce depth calculation on mobile
      zIndex: total - i,
      scale: 1 - (i * 0.05) // Subtle scale down for back cards
    };
  };

  const setCardPosition = (el: HTMLElement, slot: Slot, skew: number) => {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: skew,
      scale: slot.scale, // Apply scale
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      overwrite: 'auto' // Ensure we don't have conflicting tweens
    });
  };

  // Initial Placement
  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
        if (r.current) {
            setCardPosition(r.current, getSlot(i, total), config.skew);
        }
    });
  }, [cardDistance, verticalDistance, config, refs, isMobile]);

  const swap = () => {
    if (order.current.length < 2) return;
    if (tlRef.current && tlRef.current.isActive()) return;

    const [front, ...rest] = order.current;
    const elFront = refs[front].current!;
    
    const tl = gsap.timeline({
        onComplete: () => {
            order.current = [...rest, front];
        }
    });
    tlRef.current = tl;

    // 1. Drop the front card
    tl.to(elFront, {
      y: isMobile ? '+=200' : '+=500', // Shorter drop on mobile
      rotation: isMobile ? -5 : 0, // Slight tilt on mobile drop instead of massive distance
      duration: config.durDrop,
      ease: config.ease
    });

    // 2. Move the rest forward
    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = refs[idx].current!;
      const slot = getSlot(i, refs.length);
      
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        scale: slot.scale,
        skewY: config.skew,
        duration: config.durMove,
        ease: config.ease
      }, `promote+=${i * 0.1}`);
    });

    // 3. Return the front card to the back
    const backSlot = getSlot(refs.length - 1, refs.length);
    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    
    tl.set(elFront, { zIndex: backSlot.zIndex }, 'return');
    tl.to(elFront, {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      scale: backSlot.scale,
      rotation: 0, // Reset rotation
      skewY: config.skew,
      duration: config.durReturn,
      ease: config.ease
    }, 'return');
  };

  useImperativeHandle(ref, () => ({ triggerSwap: swap }));

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
          }
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div
      className="relative perspective-[1000px]" // Standardize perspective
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
});

CardSwap.displayName = "CardSwap";
export default CardSwap;