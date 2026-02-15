import React, { useState } from 'react';
import { editImage } from '../../../services/geminiService';
import { PencilAltIcon, SpinnerIcon, XCircleIcon, PhotographIcon } from '../Icons';

const ImageEditorSection: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ preview: string; data: string; mimeType: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for inline data
        setError('Image size should be less than 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setOriginalImage({
          preview: result,
          data: base64Data,
          mimeType: file.type,
        });
        setEditedImage(null);
        setError(null);
        setPrompt('');
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const resultBase64 = await editImage(originalImage.data, originalImage.mimeType, prompt);
      setEditedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during image editing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setError(null);
    setIsLoading(false);
    setPrompt('');
  };

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Image Editor</h2>
      {!originalImage ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <PencilAltIcon className="h-12 w-12 text-[var(--muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Upload an Image to Edit</h3>
            <p className="text-sm text-[var(--muted)] mt-1">Use text prompts to modify your photos with AI.</p>
            <input
              type="file"
              id="image-editor-upload"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
            />
            <label
              htmlFor="image-editor-upload"
              className="mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-2 px-6 rounded-full hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
            >
              Choose File
            </label>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Original Image</h3>
              <img src={originalImage.preview} alt="Original preview" className="rounded-lg shadow-sm w-full max-h-80 object-contain bg-[var(--background)]" />
               <div className="mt-4">
                <label htmlFor="image-edit-prompt" className="block text-sm font-bold text-[var(--muted)] mb-2">Editing Instruction</label>
                <textarea
                  id="image-edit-prompt"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                  placeholder="e.g., Add a retro filter"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleEdit}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 px-4 rounded-full hover:opacity-90 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="h-5 w-5" />
                      Editing...
                    </>
                  ) : (
                    "✨ Edit with Gemini"
                  )}
                </button>
                <button onClick={handleReset} className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium">
                  Reset
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Edited Image</h3>
              <div className="bg-[var(--background)] rounded-lg min-h-[320px] max-h-80 flex items-center justify-center overflow-hidden">
                {isLoading && (
                   <div className="flex flex-col items-center justify-center h-full text-[var(--muted)]">
                     <SpinnerIcon className="h-8 w-8" />
                     <p className="mt-2">Gemini is creating...</p>
                   </div>
                )}
                {error && (
                  <div className="p-4 flex flex-col items-center text-center gap-2 text-red-600 dark:text-red-400">
                    <XCircleIcon className="h-8 w-8" />
                    <p className="font-semibold">{error}</p>
                  </div>
                )}
                {editedImage && !isLoading && (
                  <img src={editedImage} alt="Edited result" className="rounded-lg shadow-sm w-full h-full object-contain" />
                )}
                 {!editedImage && !isLoading && !error && (
                   <div className="text-center p-4">
                     <PhotographIcon className="h-12 w-12 text-[var(--muted)] mx-auto mb-2" />
                     <p className="text-[var(--muted)]">Your edited image will appear here.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ImageEditorSection;