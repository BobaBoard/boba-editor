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
  return <div onClick={onClick}>{slug}</div>;
};

export default BoardPreview;
