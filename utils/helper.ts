
import cropTranslations from "@/assets/translations/crops-ur.json";
import cityTranslations from "@/assets/translations/cities-ur.json";
import { CropPrice } from "@/hooks/useApi";
import { ColorScheme } from "@/constants/Colors";
import { getColor } from "@/utils/styles";

export const getCleanCropName = (cropString: string) => {
        return cropString.replace(/^\d+/, '').trim();
    };

    const getUnit = (crop: string) => {
    if (crop.includes("DOZEN")) return "DOZEN";
    if (crop.includes("100Pcs")) return "100PCS";
    return "100KG";
};

const convertTo1Kg = (price: string | number) => {
    return Math.round(Number(price) / 100);
};

// ✅ Get Display Price (Smart Logic)
const getUnitLabel = (unit: string, language: string) => {
    const isUrdu = language === 'ur';

    if (unit === '100KG') return isUrdu ? 'فی کلو' : 'per kg';
    if (unit === 'DOZEN') return isUrdu ? 'فی درجن' : 'per dozen';
    if (unit === '100PCS') return isUrdu ? 'فی 100 عدد' : 'per 100 pcs';
    return '';
};

export const getDisplayPrice = (item: CropPrice, language: string = 'en') => {
    const unit = getUnit(item.crop);

    if (unit === "100KG") {
        return {
            min: convertTo1Kg(item.min_price),
            max: convertTo1Kg(item.max_price),
            unitLabel: getUnitLabel(unit, language)
        };
    }

    if (unit === "DOZEN") {
        return {
            min: item.min_price,
            max: item.max_price,
            unitLabel: getUnitLabel(unit, language)
        };
    }

    if (unit === "100PCS") {
        return {
            min: item.min_price,
            max: item.max_price,
            unitLabel: getUnitLabel(unit, language)
        };
    }

    return {
        min: item.min_price,
        max: item.max_price,
        unitLabel: ""
    };
};

const normalize = (text: string) =>
  text.replace(/\s+/g, " ").trim();

const URDU_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;

type CropTranslationEntry = {
    en: string;
    ur: string;
};

const getCropTranslationMap = () => cropTranslations as Record<string, string | CropTranslationEntry>;

const resolveCropEntry = (value: string | CropTranslationEntry | undefined, fallbackKey: string): CropTranslationEntry | null => {
    if (!value) return null;

    if (typeof value === 'string') {
        return { en: fallbackKey, ur: value };
    }

    return {
        en: value.en || fallbackKey,
        ur: value.ur || '',
    };
};

const getTranslationVariants = (cleaned: string): string[] => {
    return [
        cleaned,
        cleaned.replace(/\s*\(/g, '(').replace(/\)\s*/g, ')'),
        cleaned.replace(/\(/g, ' (').replace(/\s+\(/g, ' ('),
        cleaned.replace(/\([^)]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][^)]*\)/g, ''),
        cleaned.replace(/\([^)]*\)/g, ''),
    ].map(normalize);
};

const normalizeLookupKey = (value: string): string => {
    return normalize(value)
        .toLowerCase()
        .replace(/\s*\(/g, '(')
        .replace(/\)\s*/g, ')')
        .replace(/\s+/g, ' ')
        .trim();
};

const findCropEntry = (
    translations: Record<string, string | CropTranslationEntry>,
    variant: string
): CropTranslationEntry | null => {
    const direct = resolveCropEntry(translations[variant], variant);
    if (direct) {
        return direct;
    }

    const caseInsensitiveKey = Object.keys(translations).find(
        (key) => key.toLowerCase() === variant.toLowerCase()
    );
    if (caseInsensitiveKey) {
        return resolveCropEntry(translations[caseInsensitiveKey], caseInsensitiveKey);
    }

    const normalizedVariant = normalizeLookupKey(variant);
    const normalizedKey = Object.keys(translations).find(
        (key) => normalizeLookupKey(key) === normalizedVariant
    );

    if (normalizedKey) {
        return resolveCropEntry(translations[normalizedKey], normalizedKey);
    }

    return null;
};

const getUrduCropTranslation = (cleaned: string): string | null => {
    const translations = getCropTranslationMap();
    const variants = getTranslationVariants(cleaned);

    for (const variant of variants) {
        const entry = findCropEntry(translations, variant);
        if (entry?.ur) {
            return entry.ur;
        }
    }

    return null;
};

const getEnglishCropTranslation = (cleaned: string): string | null => {
    const translations = getCropTranslationMap();
    const variants = getTranslationVariants(cleaned);

    for (const variant of variants) {
        const entry = findCropEntry(translations, variant);
        if (entry?.en) {
            return normalize(entry.en);
        }
    }

    return null;
};

const getEnglishCropLabel = (cleaned: string): string => {
    return normalize(
        cleaned
            .replace(/\(\s*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+\s*\)/g, '')
            .replace(URDU_CHAR_REGEX, '')
            .replace(/\(\s*\)/g, '')
    );
};

// Get crop name in the specified language or current app language
export const getCropName = (crop: string, language: string = 'en'): string => {
    const cleaned = normalize(getCleanCropName(crop));

    if (language === 'ur') {
        return getUrduCropTranslation(cleaned) || cleaned;
    }

    // In English mode, hide embedded Urdu text and keep only English crop label.
    return getEnglishCropTranslation(cleaned) || getEnglishCropLabel(cleaned);
};

export const getBilingualCropName = (crop: string): string => {
    const cleaned = normalize(getCleanCropName(crop));
    if (!cleaned) return '';

    const englishName = getEnglishCropTranslation(cleaned) || getEnglishCropLabel(cleaned);
    const urduName = getUrduCropTranslation(cleaned);

    if (!urduName || urduName === englishName) {
        return englishName;
    }

    return `${englishName} - ${urduName}`;
};

// Get city name in the specified language or current app language
export const getCityName = (city: string, language: string = 'en'): string => {
    if (language === 'ur') {
        return (cityTranslations as Record<string, string>)[city] || city;
    }

    // For English, return the original city name
    return city;
};

// Legacy functions for backward compatibility
export const getUrduCropName = (crop: string) => {
    const cleaned = normalize(getCleanCropName(crop));
   return getUrduCropTranslation(cleaned) || cleaned;
};

export const getUrduCityName = (city: string) => {
  return (cityTranslations as Record<string, string>)[city] || city;
}

// Sanitizes markdown-rich AI responses before text-to-speech playback.
export const sanitizeTextForSpeech = (rawText: string): string => {
    let text = rawText;

    text = text.replace(/```[\s\S]*?```/g, ' ');
    text = text.replace(/`([^`]*)`/g, '$1');

    text = text.replace(/\[([^]]+)]\(([^)]+)\)/g, '$1');
    text = text.replace(/https?:\/\/\S+/g, ' ');
    text = text.replace(/www\.\S+/g, ' ');

    text = text.replace(/^#{1,6}\s+/gm, '');
    text = text.replace(/^\s*>+\s?/gm, '');
    text = text.replace(/^\s*[-*+]\s+/gm, '');
    text = text.replace(/^\s*\d+[.)]\s+/gm, '');
    text = text.replace(/^\s*\|/gm, '');
    text = text.replace(/\|\s*$/gm, '');
    text = text.replace(/^\s*[-:|]{3,}\s*$/gm, '');
    text = text.replace(/\*\*|__|~~|[*_~#>|]/g, ' ');

    text = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ' ');
    text = text.replace(/[^\p{L}\p{N}\s.,!?;:'"()\-]/gu, ' ');
    text = text.replace(/\s*-{2,}\s*/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    return text;
};

export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getChatMarkdownStyles = (colorScheme: ColorScheme) => ({
    body: {
        color: getColor(colorScheme, 'primary'),
        fontSize: 16,
        fontWeight: '400' as const,
    },
    heading1: {
        color: getColor(colorScheme, 'primary'),
        fontSize: 24,
        fontWeight: '600' as const,
        marginTop: 8,
        marginBottom: 10,
    },
    heading2: {
        color: getColor(colorScheme, 'primary'),
        fontSize: 20,
        fontWeight: '600' as const,
        marginTop: 8,
        marginBottom: 8,
    },
    heading3: {
        color: getColor(colorScheme, 'primary'),
        fontSize: 18,
        fontWeight: '600' as const,
        marginTop: 6,
        marginBottom: 6,
    },
    heading4: {
        color: getColor(colorScheme, 'primary'),
        fontSize: 16,
        fontWeight: '600' as const,
        marginTop: 6,
        marginBottom: 6,
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 8,
    },
    strong: {
        color: getColor(colorScheme, 'primary'),
        fontWeight: '600' as const,
    },
    em: {
        color: getColor(colorScheme, 'primary'),
        fontStyle: 'italic' as const,
    },
    bullet_list: {
        marginTop: 0,
        marginBottom: 8,
    },
    ordered_list: {
        marginTop: 0,
        marginBottom: 8,
    },
    code_inline: {
        backgroundColor: getColor(colorScheme, 'surface'),
        color: getColor(colorScheme, 'primary'),
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    code_block: {
        backgroundColor: getColor(colorScheme, 'surface'),
        color: getColor(colorScheme, 'primary'),
        borderRadius: 8,
        padding: 10,
    },
});

