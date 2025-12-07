export default function InputField({ placeholder, type, onChange, value, ...props }) {
    return (
        <div className="bg-white h-12 text-lg w-120 rounded-3xl shadow-[0px_5px_20px_rgba(0,0,0,0.4)] m-2">
            <input
                className="h-full w-full p-6 focus:border-none focus:ring-0 outline-none"
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                {...props}
            />
        </div>
    );
}
