import React from "react";
import "@/src/styles/home.css";
import greenDot from '@/public/assets/green-dot.svg';
import grayDot from "@/public/assets/grey-dot.svg";
import DEFAULT_NO_IMAGE from "@/public/assets/default_icon_listing.png";
import { cn } from "@/lib/utils";
const EXAMPLE_MAIN_URL = window.location.origin;

export const ProductCard = ({product, isSmall=false, className}) => {

  const productProfileImage = (media) => {
    if (!media || !media.length) {
      return DEFAULT_NO_IMAGE;
    }

    const profileImg = media.find(m => m.type === "image");
    return profileImg?.url || DEFAULT_NO_IMAGE;
  };

  const obj = []

  return (

      <div className={cn("border cursor-pointer text-sm hover:bg-stone-100 w-full flex gap-4 items-center px-4 py-4 rounded-lg border-stone-300", className)}>
        <div className="relative">
          <img className="absolute top-[-4px] left-[-4px]" src={product.is_active ? greenDot : grayDot} alt="status" />
          <img className="h-20 w-20 object-cover rounded-xl" src={productProfileImage(product.media)} alt={product.name} />
        </div>
        <div className="flex-col">
          <div className="flex gap-2">
            <div className="font-semibold" data-testid={`product-name-${product.id}`}>
              {product.name}
            </div>
            {!isSmall ? <div className="product-item-code">|</div> : null}
            {!isSmall ? product.item_code && (
              <span className="product-item-code">
                Item Code:
                <span className="cl-RoyalBlue" data-testid={`product-item-code-${product.id}`}>
                  {product.item_code}
                </span>
              </span>
            ): null}
          </div>
          {product.brand && (
            <div className="product-brand-name" data-testid={`product-brand-name-${product.id}`}>
              {product.brand.name}
            </div>
          )}
          {product.category_slug && (
            <div className="product-category" data-testid={`product-category-slug-${product.id}`}>
              Category: <span>{product.category_slug}</span>
            </div>
          )}
        </div>
      </div>

  );
}
