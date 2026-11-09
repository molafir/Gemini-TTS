import React from 'react';
import { X, User, Award, BookOpen, Feather, Compass, Heart } from 'lucide-react';
import { POEM_TITLE } from '../data/poem';

interface PoetBioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PoetBioModal: React.FC<PoetBioModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poet-bio-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0f1422] border border-amber-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-300">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 id="poet-bio-title" className="text-lg font-bold text-slate-100 font-display">
                Mir Gul Khan Naseer (میر گل خان نصیر)
              </h3>
              <p className="text-xs text-amber-500 font-medium">
                1914 – 1983 • Malek-osh-Sho'ara (ملک الشعراء)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close poet biography modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          {/* Hero Bio Banner */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 flex items-start gap-3">
            <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200 mb-1">
                The Revolutionary Voice of Balochistan
              </p>
              <p className="text-xs sm:text-sm text-slate-300">
                Mir Gul Khan Naseer was a titanic literary and political figure. As a poet, historian, journalist, and statesman, he dedicated his life to awakening the oppressed, defending cultural heritage, and combating fatalism and colonial subjugation.
              </p>
            </div>
          </div>

          {/* About the Poem */}
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Significance of "O Mardaaren Baloch"</span>
            </h4>
            <p className="mb-3">
              This celebrated masterpiece is a passionate anthem addressed directly to the youth (<em>ورنا</em>). Rather than offering passive condolences, the poet forcefully dismantles despair and self-pity.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <p className="font-semibold text-amber-400">Core Philosophical Themes:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>
                  <strong>Rejecting Fatalism:</strong> The bridle of destiny (<em>تکدیرءِ مهار</em>) is not pre-ordained in stone—it belongs in your own hands.
                </li>
                <li>
                  <strong>The Seafaring Allegory:</strong> Drawing on the historic maritime culture of Makran and the Arabian Sea, the poet compares society to a wooden vessel (<em>بوجی</em>) braving mountainous waves (<em>چئول</em>).
                </li>
                <li>
                  <strong>Demystifying Fear:</strong> The external oppressors and difficulties that roar like beasts are exposed as phantoms that flee when confronted with steadfast courage.
                </li>
                <li>
                  <strong>Inevitability of Dawn:</strong> The poem culminates in the eternal promise: <em>« اے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار »</em> (Neither this dark night nor this grim era will last).
                </li>
              </ul>
            </div>
          </div>

          {/* Poet's Life & Legacy */}
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Literary Legacy & Honors</span>
            </h4>
            <p className="text-slate-300">
              Mir Gul Khan Naseer authored numerous seminal works in Balochi, Urdu, and Persian, including <em>Gulbaang</em> (گلبانگ), <em>Chap o Chaot</em>, and extensive historical treaties on Balochistan. Posthumously awarded Pakistan's prestigious <em>Sitara-e-Imtiaz</em>, he remains revered across the globe as a poet of freedom, dignity, and universal human rights.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 italic">
            "Steel your youthful heart, and listen to the words of Naseer."
          </p>
        </div>
      </div>
    </div>
  );
};
