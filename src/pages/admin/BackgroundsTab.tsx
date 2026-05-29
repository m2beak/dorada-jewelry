import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, ImageIcon, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import { useBackgrounds, backgroundKeys } from '@/hooks/useBackgrounds';
import { updateBackground, validateImageFile } from '@/services/database';
import { uploadImageToStorage, deleteImageFromStorage } from '@/services/uploadImage';
import { useApp } from '@/contexts/AppContext';

interface SectionConfig {
  key: string;
  title: string;
  description: string;
  defaultLabel: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'hero',
    title: 'خلفية واجهة الهيرو الرئيسية (Hero Banner)',
    description: 'تظهر في أعلى الصفحة الرئيسية كخلفية لاسم المتجر وزر الاستعراض.',
    defaultLabel: 'خلفية الهيرو الافتراضية'
  },
  {
    key: 'testimonials',
    title: 'خلفية قسم آراء العملاء (Testimonials)',
    description: 'تظهر خلف كاروسيل آراء وتقييمات العملاء.',
    defaultLabel: 'خلفية التقييمات الافتراضية'
  },
  {
    key: 'cta',
    title: 'خلفية قسم الحث على الشراء (CTA Background)',
    description: 'تظهر خلف تفاصيل الاتصال السريع أو دعوة الشراء الأخيرة.',
    defaultLabel: 'خلفية CTA الافتراضية'
  }
];

export const BackgroundsTab: React.FC = () => {
  const { data: backgrounds = {}, isLoading, refetch } = useBackgrounds();
  const { showToast } = useApp();
  const queryClient = useQueryClient();
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'ملف غير صالح', 'error');
      return;
    }

    setUploadingSection(sectionKey);
    try {
      // 1. Upload to Supabase Storage (jewelry-assets bucket)
      const publicUrl = await uploadImageToStorage(file, 'jewelry-assets');

      // 2. Delete old image from storage if it exists and is custom
      const oldUrl = backgrounds[sectionKey];
      if (oldUrl && oldUrl.includes('supabase') && oldUrl.includes('jewelry-assets')) {
        try {
          await deleteImageFromStorage(oldUrl, 'jewelry-assets');
        } catch (delErr) {
          console.warn('Could not delete old background image:', delErr);
        }
      }

      // 3. Upsert path in backgrounds database table
      const dbResult = await updateBackground(sectionKey, publicUrl);
      if (!dbResult.success) {
        throw new Error(dbResult.error || 'فشل حفظ مسار الصورة في قاعدة البيانات');
      }

      // 4. Invalidate backgrounds queries to trigger instant UI refresh
      queryClient.invalidateQueries({ queryKey: backgroundKeys.all });
      await refetch();
      
      showToast('تم تحديث الخلفية بنجاح!', 'success');
    } catch (err: any) {
      console.error('Error uploading background:', err);
      showToast(err.message || 'حدث خطأ أثناء الرفع', 'error');
    } finally {
      setUploadingSection(null);
      // Reset input
      e.target.value = '';
    }
  };

  const handleResetBackground = async (sectionKey: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف الخلفية المخصصة والعودة للخلفية الافتراضية؟')) {
      return;
    }

    const oldUrl = backgrounds[sectionKey];
    if (!oldUrl) return;

    try {
      // 1. Delete from storage if it exists
      if (oldUrl.includes('supabase')) {
        await deleteImageFromStorage(oldUrl, 'jewelry-assets');
      }

      // 2. Delete row/setting from backgrounds table by updating it to empty or deleting
      // Since it's easier to upsert an empty string, or we can use supabase query directly, 
      // but let's just delete the row via supabase in a helper or directly:
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('backgrounds')
        .delete()
        .eq('section_key', sectionKey);

      if (error) throw error;

      // 3. Refresh State
      queryClient.invalidateQueries({ queryKey: backgroundKeys.all });
      await refetch();
      
      showToast('تمت إعادة تعيين الخلفية للافتراضية', 'success');
    } catch (err: any) {
      console.error('Error resetting background:', err);
      showToast(err.message || 'حدث خطأ أثناء إعادة التعيين', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <RefreshCw className="w-10 h-10 text-dorada-gold animate-spin" />
        <p className="text-dorada-cream/60 text-sm">جاري تحميل الخلفيات والبنرات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-400">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">ملاحظة هامة لقاعدة البيانات:</p>
          <p className="text-amber-400/80 leading-relaxed">
            يجب إنشاء جدول <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">backgrounds</code> وإنشاء مخزن ملفات باسم 
            <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">jewelry-assets</code> في لوحة تحكم Supabase الخاصة بك لتعمل هذه الخاصية بشكل صحيح.
            إذا لم يكن الجدول منشأً بعد، فسيستمر المتجر في العمل بشكل طبيعي مستخدماً الخلفيات الافتراضية الأنيقة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {SECTIONS.map((section) => {
          const currentUrl = backgrounds[section.key];
          const isUploading = uploadingSection === section.key;

          return (
            <div key={section.key} className="bg-[#121c2c] border border-white/10 rounded-2xl overflow-hidden p-6 flex flex-col md:flex-row gap-6">
              {/* Thumbnail preview */}
              <div className="w-full md:w-80 h-48 bg-[#1e293b] border border-white/5 rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                {currentUrl ? (
                  <>
                    <img
                      src={currentUrl}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 border border-dorada-gold/30 text-dorada-gold text-xs flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>مخصصة</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-dorada-cream/30">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">{section.defaultLabel}</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white">
                    <RefreshCw className="w-8 h-8 text-dorada-gold animate-spin" />
                    <span className="text-xs">جاري الرفع...</span>
                  </div>
                )}
              </div>

              {/* Details & Actions */}
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-dorada-cream/60 leading-relaxed mb-4">
                    {section.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="gold-btn py-2.5 px-6 text-sm flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>رفع صورة جديدة</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleFileUpload(e, section.key)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  {currentUrl && (
                    <button
                      onClick={() => handleResetBackground(section.key)}
                      disabled={isUploading}
                      className="px-6 py-2.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all disabled:opacity-50"
                    >
                      إعادة تعيين للافتراضي
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
