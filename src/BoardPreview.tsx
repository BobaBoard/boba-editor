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

const SubBoard: React.FC<{ name: string; avatar: string; color: string }> = (
  props
) => {
  return (
    <>
      <div className="sub-board">#{props.name}</div>
      <style jsx>{`
        .sub-board {
          display: inline-block;
          padding: 5px 10px;
          border: 3px black solid;
          border-radius: 10px;
          background-color: ${props.color};
          font-weight: bold;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

const Slug: React.FC<{ name: string }> = (props) => {
  return (
    <div className="slug-container">
      <span>/{props.name}/</span>
      <style jsx>{`
        .slug-container {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 15px;
          height: 100%;
          color: white;
          font-size: 50px;
          position: relative;
        }
        span {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          position: absolute;
        }
      `}</style>
    </div>
  );
};

const BoardPreview: React.FC<BoardPreviewProps> = ({
  slug,
  avatar,
  onClick,
  subBoards,
}) => {
  console.log(avatar);
  return (
    <>
      <div className="container" onClick={onClick}>
        <Slug name={slug} />
      </div>
      <div className="sub-boards">
        <SubBoard name="blood" avatar="" color="#f96680" />
        <SubBoard name="knifeplay" avatar="" color="#93b3b0" />
        <SubBoard name="aesthetic" avatar="" color="#24d282" />
      </div>
      <style jsx>{`
        .container {
            cursor: pointer;
            position: relative;
            background: url("/${avatar}");
            background-size: cover;
            background-position: 0px -100px;
            max-width: 350px;
            height: 150px;
            border-radius: 15px;
            border: 3px black solid;
        }
        .sub-boards {
            display: flex;
            justify-content: space-evenly;
            margin-top: 5px;
            max-width: 350px;
        }
      `}</style>
    </>
  );
};

export default BoardPreview;
