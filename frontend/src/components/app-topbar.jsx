import Button from "@/components/ui/button";

const logo = (
    <div className="h-full flex items-center justify-between">
        <img src="/img/logo1.png" className="h-36 object-contain" />
    </div>
);

function AppTopbar() {
    return (
        <div className="w-full">
            <div className="w-full h-24 p-4  bg-topbarBg flex items-center">
                <div className=" z-10 h-full ">{logo}</div>

                <div className="flex space-x-4 justify-center flex-1">
                    <Button type="type1" href={"/"}>
                        Trang chủ
                    </Button>
                    <Button type="type1" href={"/School"}>
                        Trường học
                    </Button>
                    <Button type="type1" href={"/Student"}>
                        Sinh viên
                    </Button>
                    {/* <Button size="sm" >Liên hệ</Button> */}
                </div>
                <div className="flex items-center">
                    <Button type="type2">Login</Button>
                </div>
            </div>
            <div className="w-full h-1.5 bg-topbarBorder"></div>
        </div>
    );
}

export { AppTopbar };
