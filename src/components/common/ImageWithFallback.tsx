import { useState, memo } from "react";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** URL de la imagen principal */
  src: string;
  /** URL de la imagen de fallback */
  fallbackSrc?: string;
  /** Alt text para la imagen */
  alt: string;
  /** Clases CSS adicionales */
  className?: string;
}

const DEFAULT_FALLBACK = "/imagenotfound.jpeg";

export const ImageWithFallback = memo(function ImageWithFallback({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  className = "",
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
});

ImageWithFallback.displayName = "ImageWithFallback";
