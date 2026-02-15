import React, { useState } from 'react';
import { analyzeImage } from '../../../services/geminiService';
import { PhotographIcon, SpinnerIcon, XCircleIcon, TrashIcon } from '../Icons';

const ImageAnalyzerSection: React.FC = () => {
  const [image, setImage] = useState<{ preview: string; data: string; mimeType: string } | null>(null);
  const [prompt, setPrompt] = useState<string>('Describe this image in detail. What objects are present, what is the setting, and what might be happening?');
  const [analysis, setAnalysis] = useState<string | null>(null);
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
        setImage({
          preview: result,
          data: base64Data,
          mimeType: file.type,
        });
        setAnalysis(null);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeImage(image.data, image.mimeType, prompt);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setPrompt('Describe this image in detail. What objects are present, what is the setting, and what might be happening?');
  };

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Image Analyzer</h2>
        {!image ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <PhotographIcon className="h-12 w-12 text-[var(--muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Upload an Image</h3>
            <p className="text-sm text-[var(--muted)] mt-1">Let Harmony AI analyze it for you.</p>
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
            />
            <label
              htmlFor="image-upload"
              className="mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-2 px-6 rounded-full hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
            >
              Choose File
            </label>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Your Image</h3>
              <img src={image.preview} alt="Uploaded preview" className="rounded-lg shadow-sm w-full max-h-80 object-contain" />
               <div className="mt-4">
                <label htmlFor="image-prompt" className="block text-sm font-bold text-[var(--muted)] mb-2">Your Question</label>
                <textarea
                  id="image-prompt"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                  placeholder="e.g., What style of art is this?"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 px-4 rounded-full hover:opacity-90 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="h-5 w-5" />
                      Analyzing...
                    </>
                  ) : (
                    "✨ Analyze with Gemini"
                  )}
                </button>
                <button 
                  onClick={handleReset} 
                  className="px-6 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                  title="Clear image and reset"
                >
                  <TrashIcon className="h-5 w-5" />
                  Clear
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Analysis</h3>
              <div className="bg-[var(--background)] rounded-lg p-4 min-h-[200px] max-h-80 overflow-y-auto">
                {isLoading && (
                   <div className="flex items-center justify-center h-full text-[var(--muted)]">
                     <p>Gemini is thinking...</p>
                   </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircleIcon className="h-5 w-5" />
                    <p className="font-semibold">{error}</p>
                  </div>
                )}
                {analysis && (
                  <p className="text-[var(--foreground)] whitespace-pre-wrap">{analysis}</p>
                )}
                 {!analysis && !isLoading && !error && (
                   <p className="text-[var(--muted)]">Analysis results will appear here.</p>
                 )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ImageAnalyzerSection;