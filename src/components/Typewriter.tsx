import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = '',
}) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [delta, setDelta] = useState(typingSpeed);

  useEffect(() => {
    let ticker = setTimeout(() => {
      tick();
    }, delta);

    return () => clearTimeout(ticker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delta]);

  const tick = () => {
    const i = loopNum % phrases.length;
    const fullText = phrases[i];
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(deletingSpeed);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(pauseDuration);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(typingSpeed);
    } else if (!isDeleting && updatedText !== fullText) {
      // Randomize typing speed slightly for realism
      setDelta(typingSpeed + Math.random() * 50);
    }
  };

  return (
    <span className={`${className} typing-cursor`}>
      {text}
    </span>
  );
};