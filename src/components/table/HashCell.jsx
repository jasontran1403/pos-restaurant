const HashCell = ({ getValue }) => {
    const hash = getValue();
  
    if (!hash) return null; // If hash is empty or null, return nothing
  
    const url = `https://bscscan.com/tx/${hash}`;
  
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Hash
      </a>
    );
  };
  
  export default HashCell;
  