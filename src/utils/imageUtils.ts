export const dataURLtoFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

export const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      
      // Calculate new dimensions
      let newWidth = width;
      let newHeight = height;
      
      if (width > height) {
        if (width > maxWidth) {
          newHeight = (height * maxWidth) / width;
          newWidth = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          newWidth = (width * maxHeight) / height;
          newHeight = maxHeight;
        }
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const cropToSquare = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;
      
      canvas.width = 400;
      canvas.height = 400;
      
      ctx?.drawImage(img, startX, startY, size, size, 0, 0, 400, 400);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.src = imageDataUrl;
  });
};