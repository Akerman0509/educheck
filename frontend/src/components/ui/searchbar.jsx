

function SearchBar() {
  return (
    <div className="bg-white h-12 text-lg w-100 rounded-3xl shadow-[0px_5px_20px_rgba(0,0,0,0.6)] m-2">
      <input className="h-full w-full p-6 focus:border-none focus:ring-0 outline-none" 
      
      type="text" placeholder="Nhập số hiệu văn bằng" />
    </div>
  );
}


export default SearchBar;