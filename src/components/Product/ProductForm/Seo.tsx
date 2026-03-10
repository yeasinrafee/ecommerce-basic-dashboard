import React from "react";
import { X } from "lucide-react";

import CustomInput from "../../FormFields/CustomInput";
import CustomTextArea from "../../FormFields/CustomTextArea";

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
}

interface SeoProps {
  onChange?: (data: SeoData) => void;
  initialData?: SeoData;
}

const Seo: React.FC<SeoProps> = ({ onChange, initialData }) => {
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [seoKeywords, setSeoKeywords] = React.useState<string[]>([]);
  const [keywordInput, setKeywordInput] = React.useState("");

  // keep track of last data sent so we can avoid redundant updates
  const prevDataRef = React.useRef<SeoData | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setMetaTitle(initialData.metaTitle ?? "");
      setMetaDescription(initialData.metaDescription ?? "");
      setSeoKeywords(initialData.seoKeywords ?? []);
    }
  }, [initialData]);

  const addKeyword = (value: string) => {
    const inputs = value
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    if (!inputs.length) return;
    setSeoKeywords((prev) => {
      const next = [...prev];
      inputs.forEach((keyword) => {
        if (!next.includes(keyword)) {
          next.push(keyword);
        }
      });
      return next;
    });
  };

  const handleKeywordKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword(keywordInput);
      setKeywordInput("");
    }
  };

  const handleKeywordBlur = () => {
    if (keywordInput) {
      addKeyword(keywordInput);
      setKeywordInput("");
    }
  };

  // only notify parent when actual SEO data changes to avoid endless update loops
  React.useEffect(() => {
    if (!onChange) return;

    const newData: SeoData = { metaTitle, metaDescription, seoKeywords };

    // compare with last sent values to avoid repeating identical updates
    const prev = prevDataRef.current;
    const changed =
      !prev ||
      prev.metaTitle !== newData.metaTitle ||
      prev.metaDescription !== newData.metaDescription ||
      prev.seoKeywords.length !== newData.seoKeywords.length ||
      prev.seoKeywords.some((k, i) => k !== newData.seoKeywords[i]);

    if (changed) {
      prevDataRef.current = newData;
      onChange(newData);
    }
  }, [metaTitle, metaDescription, seoKeywords, onChange]);

  return (
    <div className="space-y-5">
      <CustomInput
        label="SEO Meta Title"
        value={metaTitle}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(event.target.value)}
      />
      <CustomTextArea
        label="SEO Meta Description"
        value={metaDescription}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(event.target.value)}
        className="min-h-35"
      />
      <div className="space-y-2">
        <CustomInput
          label="Meta Keywords"
          placeholder="Add keywords, press Enter or comma"
          value={keywordInput}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setKeywordInput(event.target.value)}
          onKeyDown={handleKeywordKeyDown}
          onBlur={handleKeywordBlur}
        />
        <div className="flex flex-wrap gap-2">
          {seoKeywords.map((keyword) => (
            <span
              key={keyword}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() =>
                  setSeoKeywords((prev) => prev.filter((item) => item !== keyword))
                }
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Seo;