import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RefreshCw, AlertTriangle, Check, Gift, Percent, Image } from 'lucide-react';
import { useWheelSettings, wheelKeys } from '@/hooks/useWheelSettings';
import { updateWheelSettings } from '@/services/database';
import { useApp } from '@/contexts/AppContext';
import type { Prize } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const WheelSettingsTab: React.FC = () => {
  const { data: settings, isLoading, refetch } = useWheelSettings();
  const { showToast } = useApp();
  const queryClient = useQueryClient();

  const [enabled, setEnabled] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPrizeId, setUploadingPrizeId] = useState<string | null>(null);

  // Sync state with queried settings data
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setPrizes(settings.prizes || []);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <RefreshCw className="w-10 h-10 text-dorada-gold animate-spin" />
        <p className="text-dorada-cream/60 text-sm">جاري تحميل إعدادات الجوائز...</p>
      </div>
    );
  }

  // Calculate sum of chances
  const totalChance = prizes.reduce((sum, p) => sum + (Number(p.chance) || 0), 0);
  const isValid = totalChance === 100;

  const handleAddPrize = () => {
    const newPrize: Prize = {
      id: uuidv4(),
      name: '',
      nameAr: '',
      chance: 0
    };
    setPrizes([...prizes, newPrize]);
  };

  const handleDeletePrize = (id: string) => {
    if (prizes.length <= 2) {
      showToast('يجب أن تحتوي المسابقة على جائزتين على الأقل لإتاحة الاختيار للزبون', 'error');
      return;
    }
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const handlePrizeChange = (id: string, field: keyof Prize, value: any) => {
    setPrizes(
      prizes.map(p => {
        if (p.id === id) {
          if (field === 'chance') {
            // Ensure only integers or valid numbers
            const num = parseInt(value) || 0;
            return { ...p, [field]: Math.max(0, num) };
          }
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleImageUpload = async (prizeId: string, file: File) => {
    setUploadingPrizeId(prizeId);
    try {
      const { uploadImageToStorage } = await import('@/services/uploadImage');
      const publicUrl = await uploadImageToStorage(file, 'jewelry-assets');
      handlePrizeChange(prizeId, 'imageUrl', publicUrl);
      showToast('تم رفع صورة الهدية بنجاح', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'فشل رفع الصورة', 'error');
    } finally {
      setUploadingPrizeId(null);
    }
  };

  const handleRemoveImage = (prizeId: string) => {
    handlePrizeChange(prizeId, 'imageUrl', '');
  };

  const handleSave = async () => {
    if (!isValid) {
      showToast('يجب أن يكون مجموع نسب الربح للجوائز مساوياً لـ 100% بالضبط لحفظ الإعدادات', 'error');
      return;
    }

    // Validate that names are not empty
    for (const p of prizes) {
      if (!p.name.trim() || !p.nameAr.trim()) {
        showToast('يرجى ملء جميع أسماء الجوائز بالعربية والإنجليزية', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      const result = await updateWheelSettings({
        enabled,
        prizes
      });

      if (!result.success) {
        throw new Error(result.error || 'فشل تحديث الإعدادات في قاعدة البيانات');
      }

      queryClient.invalidateQueries({ queryKey: wheelKeys.all });
      await refetch();
      showToast('تم حفظ إعدادات الهدايا والجوائز بنجاح!', 'success');
    } catch (err: any) {
      console.error('Error saving wheel settings:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ الإعدادات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-dorada-cream flex items-center gap-2 justify-start">
            <Gift className="w-6 h-6 text-dorada-gold" />
            <span>صناديق الهدايا الفاخرة للقطع المميزة</span>
          </h3>
          <p className="text-xs text-dorada-cream/50 mt-1.5 leading-relaxed">
            عند تفعيل هذه الخاصية، سيحصل الزبائن الذين يشترون "قطعاً مميزة" على فرصة لفتح صناديق هدايا مخملية وربح جوائز مخصصة عند الدفع.
          </p>
        </div>

        {/* Feature Switch */}
        <div className="flex items-center gap-3 bg-[#121c2c] border border-white/10 px-5 py-3 rounded-2xl">
          <span className="text-sm font-semibold text-dorada-cream">تفعيل الخاصية بالكامل</span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
              enabled ? 'bg-dorada-gold' : 'bg-white/10'
            }`}
          >
            <div
              className={`bg-[#070b11] w-4 h-4 rounded-full shadow-md transform duration-300 ${
                enabled ? '-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Probability Summary Notice */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border ${
        isValid 
          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
        {isValid ? (
          <Check className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        )}
        <div className="text-sm">
          <p className="font-semibold">
            {isValid 
              ? 'توزيع نسب الجوائز متناسق وجاهز للحفظ' 
              : 'توزيع نسب الجوائز غير متطابق!'}
          </p>
          <p className={`text-xs mt-0.5 ${isValid ? 'text-green-400/80' : 'text-red-400/80'}`}>
            يجب أن يكون مجموع نسب الاحتمال للجوائز هو <strong className="text-white">100%</strong> بالضبط. المجموع الحالي: <strong className="text-white">{totalChance}%</strong>.
            {!isValid && ` (تحتاج إلى تعديل بمقدار ${100 - totalChance}% )`}
          </p>
        </div>
      </div>

      {/* Prizes List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-serif text-lg font-semibold text-dorada-cream">قائمة الجوائز والهدايا المتاحة</h4>
          <button
            onClick={handleAddPrize}
            className="px-4 py-2 rounded-xl border border-dorada-gold/30 text-dorada-gold hover:bg-dorada-gold/10 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة هدية جديدة</span>
          </button>
        </div>

        <div className="space-y-3">
          {prizes.map((prize, idx) => (
            <div 
              key={prize.id} 
              className="bg-[#121c2c] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-dorada-cream/40 font-mono">
                  {idx + 1}
                </span>
              </div>

              {/* Image Preview & Uploader */}
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-xl bg-[#0a0f18] border border-white/5 overflow-hidden flex items-center justify-center group/img">
                  {prize.imageUrl ? (
                    <>
                      <img 
                        src={prize.imageUrl} 
                        alt={prize.nameAr} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(prize.id)}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-red-400 text-xs font-semibold"
                      >
                        إزالة
                      </button>
                    </>
                  ) : uploadingPrizeId === prize.id ? (
                    <RefreshCw className="w-5 h-5 text-dorada-gold animate-spin" />
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-dorada-cream/35 hover:text-dorada-gold transition-colors">
                      <Image className="w-5 h-5" />
                      <span className="text-[9px] mt-0.5 font-medium">صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(prize.id, file);
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title Arabic */}
              <div className="w-full md:flex-1 space-y-1">
                <label className="block text-[10px] text-dorada-cream/40 font-medium">اسم الجائزة بالعربية</label>
                <input
                  type="text"
                  value={prize.nameAr}
                  onChange={(e) => handlePrizeChange(prize.id, 'nameAr', e.target.value)}
                  placeholder="مثال: خصم 10%، قلادة مجانية..."
                  className="w-full bg-[#0a0f18] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-dorada-cream focus:border-dorada-gold/50 focus:outline-none"
                />
              </div>

              {/* Title English */}
              <div className="w-full md:flex-1 space-y-1">
                <label className="block text-[10px] text-dorada-cream/40 font-medium">اسم الجائزة بالإنجليزية</label>
                <input
                  type="text"
                  value={prize.name}
                  onChange={(e) => handlePrizeChange(prize.id, 'name', e.target.value)}
                  placeholder="e.g. 10% Discount, Free Necklace..."
                  className="w-full bg-[#0a0f18] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-dorada-cream focus:border-dorada-gold/50 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              {/* Chance percentage */}
              <div className="w-full md:w-36 space-y-1">
                <label className="block text-[10px] text-dorada-cream/40 font-medium">نسبة الربح (Probability)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={prize.chance}
                    onChange={(e) => handlePrizeChange(prize.id, 'chance', e.target.value)}
                    className="w-full bg-[#0a0f18] border border-white/5 rounded-xl pr-4 pl-10 py-2.5 text-sm text-dorada-cream focus:border-dorada-gold/50 focus:outline-none text-center font-mono"
                  />
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dorada-cream/30" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 pt-4 md:pt-4">
                <button
                  onClick={() => handleDeletePrize(prize.id)}
                  disabled={prizes.length <= 2}
                  className="p-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="حذف الجائزة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start border-t border-white/5 pt-6">
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className="gold-btn py-3 px-8 font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري حفظ الإعدادات...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
