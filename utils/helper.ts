
import cropTranslations from "@/assets/translations/crops-ur.json";
import cityTranslations from "@/assets/translations/cities-ur.json";
import { CropPrice } from "@/hooks/useApi";

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
export const getDisplayPrice = (item: CropPrice) => {
    const unit = getUnit(item.crop);

    if (unit === "100KG") {
        return {
            min: convertTo1Kg(item.min_price),
            max: convertTo1Kg(item.max_price),
            unitLabel: " فی کلو"
        };
    }

    if (unit === "DOZEN") {
        return {
            min: item.min_price,
            max: item.max_price,
            unitLabel: "فی درجن"
        };
    }

    if (unit === "100PCS") {
        return {
            min: item.min_price,
            max: item.max_price,
            unitLabel: "فی 100 عدد"
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

export const getUrduCropName = (crop: string) => {
    const cleaned = normalize(getCleanCropName(crop));
   return (cropTranslations as Record<string, string>)[cleaned] || cleaned;
};

export const getUrduCityName = (city: string) => {
  return (cityTranslations as Record<string, string>)[city] || city;
}