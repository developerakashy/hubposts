import React from "react";
import { Link } from "react-router-dom";

function formatTweetText(text) {
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const words = line.split(/(\s+)/); // preserve spacing

    const formatted = words.map((word, i) => {
      // URL
      if (/https?:\/\/[^\s]+/.test(word)) {
        return (
          <a
            key={`${lineIndex}-${i}`}
            href={word}
            className="text-[#1D9BF0] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {word}
          </a>
        );
      }

      // @mention
      if (word.startsWith("@")) {
        return (
          <a
            key={`${lineIndex}-${i}`}
            className="text-[#1D9BF0] hover:underline"
            href={`https://x.com/${word.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {word}
          </a>
        );
      }

      // #hashtag
      if (word.startsWith("#")) {
        return (
          <a
            href={`https://x.com/hashtag/${word.slice(1)}?src=hashtag_click`}
            key={`${lineIndex}-${i}`} className="text-[#1D9BF0] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {word}
          </a>
        );
      }

      return <span key={`${lineIndex}-${i}`}>{word}</span>;
    });

    return (
      <React.Fragment key={lineIndex}>
        {formatted}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default formatTweetText
