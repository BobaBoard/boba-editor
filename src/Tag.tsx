import React from "react";

export interface TagProps {
  name: string;
  avatar?: string;
  color?: string;
}
const Tag: React.FC<TagProps> = (props) => {
  return (
    <>
      <div className="tag">
        <span className="hashtag">#</span>
        {props.name}
      </div>
      <style jsx>{`
        .hashtag {
          opacity: 0.6;
          margin-right: 2px;
        }
        .tag {
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

export default Tag;
