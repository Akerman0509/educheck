


import Button from "@/components/ui/button";

function AppTopbar({}){
// container


    const logo =(
    <div className="h-full flex items-center justify-between">
        <img src="/img/logo1.png" className="h-36 object-contain"/>
    </div>);

    return (
        <div className="w-full h-26 p-4 bg-blue-100 flex items-center flex-none" >
            <div className=" z-10 h-full ">
                {logo}
            </div>


            <div className="flex space-x-4 justify-center flex-1">
                <Button size="sm" >Trang chủ</Button>
                <Button size="sm" >Trường học</Button>
                <Button size="sm" >Sinh viên</Button>
                {/* <Button size="sm" >Liên hệ</Button> */}
            </div>
            <div className="flex items-center">
                <Button size="sm" >Login</Button>
            </div>
        </div>
    )
}






export { 
    AppTopbar




 }