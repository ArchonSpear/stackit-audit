type ButtonProps = {
  onClick: any;
  title: string;
  children: any;
  disabled?: any;
  size?: string;
  type?: any;
  color?: string;
};

const Button = (props: ButtonProps) => {
  const { onClick, title, children, disabled, size = 'md', type = 'button', color } = props;

  return (
    <button className={`btn btn--${size} btn--${color}`} onClick={onClick} title={title} type={type} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
