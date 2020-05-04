import React from "react";

export interface BoardPreviewProps {
  slug: string;
  avatar: string;
  description: string;
  onClick: () => void;
}

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

const Description: React.FC<{ description: string }> = (props) => {
  return (
    <div className="description-container">
      <span>{props.description}</span>
      <style jsx>{`
        .description-container {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 15px;
          height: 100%;
          color: white;
          font-size: 30px;
          position: relative;
        }
        span {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          position: absolute;
          width: 100%;
          padding: 25px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

const BoardPreview: React.FC<BoardPreviewProps> = ({
  slug,
  avatar,
  description,
  onClick,
  children,
}) => {
  const [showDescription, setShowDescription] = React.useState(false);
  return (
    <>
      <div
        className="container"
        onClick={onClick}
        onMouseEnter={() => setShowDescription(true)}
        onMouseLeave={() => setShowDescription(false)}
      >
        {showDescription ? (
          <Description description={description} />
        ) : (
          <Slug name={slug} />
        )}
      </div>
      <div className="preview-footer">{children}</div>
      <style jsx>{`
        .container {
            cursor: pointer;
            position: relative;
            background: url("${avatar}");
            background-size: cover;
            background-position: 0px -100px;
            max-width: 350px;
            height: 150px;
            border-radius: 15px;
            border: 3px black solid;
        }
        .preview-footer {
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
