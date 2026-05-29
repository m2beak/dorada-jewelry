import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, Sparkles, HelpCircle } from 'lucide-react';
import type { Prize, WheelSettings } from '@/types';

interface JewelryBoxOpenerModalProps {
  settings: WheelSettings;
  onClose: (wonPrize: Prize) => void;
  predeterminedPrize?: Prize;
}

export const JewelryBoxOpenerModal: React.FC<JewelryBoxOpenerModalProps> = ({ settings, onClose, predeterminedPrize }) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [revealedPrizes, setRevealedPrizes] = useState<Record<string, Prize>>({});
  const [isOpening, setIsOpening] = useState(false);
  const [showDoneButton, setShowDoneButton] = useState(false);

  const boxes = [
    { id: 'box-left', label: 'الصندوق الأيمن' },
    { id: 'box-center', label: 'الصندوق الأوسط' },
    { id: 'box-right', label: 'الصندوق الأيسر' }
  ];

  // Weighted random selection algorithm
  const selectPrize = (): Prize => {
    const activePrizes = settings.prizes.filter(p => p.chance > 0);
    if (activePrizes.length === 0) {
      return { id: 'fallback', name: 'Free Shipping', nameAr: 'توصيل مجاني', chance: 100 };
    }

    const totalChance = activePrizes.reduce((sum, p) => sum + p.chance, 0);
    const random = Math.floor(Math.random() * totalChance) + 1; // 1 to totalChance

    let cumulativeChance = 0;
    for (const prize of activePrizes) {
      cumulativeChance += prize.chance;
      if (random <= cumulativeChance) {
        return prize;
      }
    }

    return activePrizes[0];
  };

  const handleBoxClick = (boxId: string) => {
    if (selectedBoxId || isOpening) return;

    setSelectedBoxId(boxId);
    setIsOpening(true);

    // 1. Use predetermined prize or roll it
    const rolledPrize = predeterminedPrize || selectPrize();
    setWinningPrize(rolledPrize);

    // 2. Select other random prizes to "reveal" in the other boxes (creates excitement!)
    const remainingPrizes = settings.prizes.filter(p => p.id !== rolledPrize.id);
    const mockPrizes = [...remainingPrizes];
    
    // Shuffle mock prizes
    for (let i = mockPrizes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mockPrizes[i], mockPrizes[j]] = [mockPrizes[j], mockPrizes[i]];
    }

    const otherBoxes = boxes.filter(b => b.id !== boxId);
    const reveals: Record<string, Prize> = {
      [boxId]: rolledPrize
    };

    otherBoxes.forEach((b, index) => {
      // Fallback if we have fewer prizes than boxes
      reveals[b.id] = mockPrizes[index] || settings.prizes[0];
    });

    setRevealedPrizes(reveals);

    // 3. Trigger animations timeline
    setTimeout(() => {
      setIsOpening(false);
      setShowDoneButton(true);
    }, 4500); // Allow animation to play fully before showing CTA
  };

  const handleFinish = () => {
    if (winningPrize) {
      onClose(winningPrize);
    }
  };

  // Custom Particle generator for confetti explosion
  const particles = Array.from({ length: 45 });

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-[9999] overflow-y-auto select-none font-sans">
      {/* Decorative Gold Particles in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dorada-gold/5 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dorada-gold/5 rounded-full filter blur-[100px] animate-pulse" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8 relative z-10 py-6">
        
        {/* Step Header */}
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-dorada-gold/10 border border-dorada-gold/30 flex items-center justify-center mx-auto text-dorada-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <Gift className="w-8 h-8 animate-pulse" />
          </motion.div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-dorada-cream tracking-wide">
            {!selectedBoxId ? 'هدية مميزة بانتظارك!' : showDoneButton ? 'مبارك لك الهدية!' : 'افتح الصندوق وكود الهدية...'}
          </h2>
          <p className="text-xs sm:text-sm text-dorada-cream/60 max-w-md mx-auto leading-relaxed">
            {!selectedBoxId 
              ? 'لقد اشتريت قطعة مميزة! اختر أحد صناديق المجوهرات المخملية بالأسفل لتكتشف هديتك القيمة المرفقة مع الطلب.' 
              : showDoneButton 
              ? 'تم ربط هديتك بنجاح برقم طلبك وسيتم تجهيزها وإرسالها مع شحنتك!'
              : 'جاري فتح صندوق المجوهرات الفاخر...'}
          </p>
        </div>

        {/* 3D Jewelry Boxes Grid */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-3xl px-4 py-8">
          {boxes.map((box) => {
            const isSelected = selectedBoxId === box.id;
            const hasStarted = selectedBoxId !== null;
            const prize = revealedPrizes[box.id];
            
            return (
              <div 
                key={box.id}
                onClick={() => handleBoxClick(box.id)}
                className={`flex flex-col items-center justify-center relative ${
                  !hasStarted ? 'cursor-pointer hover:scale-105' : ''
                } transition-all duration-300`}
              >
                {/* Box 3D visual container */}
                <div className="w-24 sm:w-44 h-24 sm:h-44 relative flex items-center justify-center">
                  
                  {/* Glowing golden light radiating from inside opened box */}
                  <AnimatePresence>
                    {hasStarted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.2 }}
                        animate={{ 
                          opacity: isSelected ? 1 : 0.25, 
                          scale: isSelected ? 1.5 : 1 
                        }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                        className={`absolute w-12 sm:w-28 h-12 sm:h-28 rounded-full filter blur-[15px] sm:blur-[30px] ${
                          isSelected ? 'bg-dorada-gold/40' : 'bg-dorada-gold/10'
                        }`}
                      />
                    )}
                  </AnimatePresence>

                  {/* SVG 3D Luxury Box representation */}
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {/* Lid (anmates up and tilts back on open) */}
                    <motion.div
                      animate={
                        hasStarted 
                          ? { 
                              y: isSelected ? -45 : -25, 
                              rotateX: -75, 
                              scale: 0.9, 
                              opacity: isSelected ? 0.7 : 0.4 
                            } 
                          : { y: 0, rotateX: 0, scale: 1 }
                      }
                      transition={{ 
                        type: 'spring', 
                        stiffness: 80, 
                        damping: 12, 
                        delay: isSelected ? 0.5 : 1.8 
                      }}
                      className="w-16 sm:w-28 h-8 sm:h-12 bg-gradient-to-b from-[#1c283c] to-[#121c2c] border-t border-x border-dorada-gold/30 rounded-t-xl relative z-20 flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)] origin-bottom"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Box gold buckle/latch top part */}
                      <div className="absolute bottom-0 w-3 sm:w-5 h-1 sm:h-2 bg-dorada-gold rounded-t" />
                      {/* Embossed gold brand logo/text placeholder */}
                      <Sparkles className="w-3 h-3 sm:w-5 sm:h-5 text-dorada-gold/25" />
                    </motion.div>

                    {/* Body (bottom half of the box) */}
                    <div className="w-16 sm:w-28 h-12 sm:h-20 bg-gradient-to-b from-[#121c2c] to-[#0a0f18] border-b border-x border-dorada-gold/25 rounded-b-xl relative z-10 shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                      {/* Red/velvet interior lining visible when lid raises */}
                      <div className="absolute inset-x-1 top-0 h-2 bg-[#7f1d1d] rounded-t-md border-t border-dorada-gold/10" />
                      
                      {/* Box gold buckle/latch bottom part */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 sm:w-5 h-2.5 sm:h-4 bg-dorada-gold/80 rounded-b flex items-center justify-center border-t border-black/30">
                        <div className="w-1 h-1.5 bg-black/80 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Won Prize Display - Card floats up from selected box */}
                  <AnimatePresence>
                    {hasStarted && prize && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ 
                          opacity: isSelected ? 1 : 0.45, 
                          y: isSelected ? -100 : -65, 
                          scale: isSelected ? 1.25 : 0.85
                        }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 100, 
                          damping: 15, 
                          delay: isSelected ? 1.2 : 2.2 
                        }}
                        className={`absolute z-30 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl border border-dorada-gold/30 bg-gradient-to-b from-[#1c283c] to-[#0a0f18] flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(212,175,55,0.15)] ${
                          isSelected 
                            ? 'ring-2 ring-dorada-gold/30 ring-offset-2 ring-offset-black/50' 
                            : 'opacity-50'
                        }`}
                      >
                        <Gift className={`w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-1.5 ${isSelected ? 'text-dorada-gold animate-bounce' : 'text-dorada-cream/40'}`} />
                        <span className="text-[10px] sm:text-xs text-dorada-cream/45 uppercase tracking-wider font-mono">الهدية</span>
                        <span className="text-[11px] sm:text-sm font-bold text-dorada-cream whitespace-nowrap mt-0.5">{prize.nameAr}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confetti Particle Explosion on select */}
                  {isSelected && showDoneButton && (
                    <div className="absolute inset-0 pointer-events-none z-50">
                      {particles.map((_, i) => {
                        const angle = (i * 360) / particles.length;
                        const velocity = 80 + Math.random() * 120;
                        const delay = Math.random() * 0.15;
                        const duration = 1.2 + Math.random() * 1.5;
                        const x = Math.cos((angle * Math.PI) / 180) * velocity;
                        const y = Math.sin((angle * Math.PI) / 180) * velocity - 20;
                        
                        return (
                          <motion.div
                            key={i}
                            initial={{ x: 0, y: -40, scale: 1, opacity: 1 }}
                            animate={{ 
                              x, 
                              y, 
                              opacity: 0, 
                              scale: 0.3,
                              rotate: angle * 2
                            }}
                            transition={{ duration, delay, ease: 'easeOut' }}
                            className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm"
                            style={{
                              backgroundColor: i % 3 === 0 
                                ? '#D4AF37' // Dorada gold
                                : i % 3 === 1 
                                ? '#f3e8ff' // Cream/white
                                : '#b45309', // Dark amber
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Box label or action */}
                <span className="text-xs sm:text-sm text-dorada-cream/45 mt-4 sm:mt-6 font-medium">
                  {!hasStarted ? (
                    <span className="flex items-center gap-1 hover:text-dorada-gold transition-colors justify-center">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{box.label}</span>
                    </span>
                  ) : isSelected ? (
                    <span className="text-dorada-gold font-bold flex items-center gap-1 bg-dorada-gold/10 border border-dorada-gold/20 px-3 py-1 rounded-full animate-pulse">
                      صندوقك المختار ✨
                    </span>
                  ) : (
                    <span className="text-dorada-cream/20">غير محدد</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button once animation is completed */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence>
            {showDoneButton && winningPrize && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Winner Card description */}
                <div className="text-sm border border-dorada-gold/20 bg-dorada-gold/5 px-6 py-2 rounded-xl text-dorada-cream/80 max-w-sm mx-auto shadow-inner">
                  لقد ربحتِ: <strong className="text-dorada-gold text-base mx-1">{winningPrize.nameAr}</strong> 🎉
                </div>
                
                <button
                  onClick={handleFinish}
                  className="gold-btn py-3 px-10 text-sm font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] animate-pulse"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد واستكمال الدفع</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
