import { useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../Button';

type InputCopyToClipboardSearchProps = {
  textToCopy: string;
};

const InputCopyToClipboard = (props: InputCopyToClipboardSearchProps) => {
  const { textToCopy } = props;
  const [isCopied, setIsCopied] = useState(false);

  async function copyTextToClipboard(text: string) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    }
  }

  const handleCopyClick = async () => {
    try {
      copyTextToClipboard(textToCopy);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className='input-copy-to-clipboard'>
      <input type='text' value={textToCopy} readOnly />
      <Button onClick={handleCopyClick} color='gradient' title='Click to copy to clipboard'>
        {isCopied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  );
};

export default InputCopyToClipboard;
