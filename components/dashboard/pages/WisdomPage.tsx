import React from 'react';
import LifeVisionSection from '../sections/LifeVisionSection';
import AnonymousChatSection from '../sections/AnonymousChatSection';
import CommunitySupportSection from '../sections/CommunitySupportSection';
import type { AnonymousPost, LifeVision } from '../../../types';

interface WisdomPageProps {
  initialLifeVision: LifeVision;
  posts: AnonymousPost[];
  onPost: (content: string) => void;
  onRequestHelp: () => void;
  onDonate: () => void;
}

const WisdomPage: React.FC<WisdomPageProps> = ({ initialLifeVision, posts, onPost, onRequestHelp, onDonate }) => {
  return (
    <>
      <div className="mb-6">
        <LifeVisionSection initialData={initialLifeVision} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[500px]">
          <AnonymousChatSection posts={posts} onPost={onPost} />
        </div>
        <CommunitySupportSection onRequestHelp={onRequestHelp} onDonate={onDonate} />
      </div>
    </>
  );
};

export default WisdomPage;