import React from "react";

export interface BoardPreviewProps {
  slug: string;
  avatar: string;
  onClick: () => void;
  subBoards?: Array<{
    slug: string;
    avatar: string;
    onClick: () => void;
  }>;
}

const BoardPreview: React.FC<BoardPreviewProps> = ({
  slug,
  avatar,
  onClick,
  subBoards,
}) => {
  return (
    <>
      <div className="container" onClick={onClick}>
        /{slug}/
      </div>
      <style jsx>{`
        .container {
          background-color: red;
        }
      `}</style>
    </>
  );
};

export default BoardPreview;
