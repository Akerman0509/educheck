import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/table";

export default function Home() {
    return (
        <div className="flex flex-1 flex-col justify-center items-center">
            <PageTitle>Tra cứu văn bằng</PageTitle>
            <div className="p-4"></div>
            <SearchBar />
            <Button className="font-semibold" type="type3" href="#">
                Tra cứu
            </Button>

            <Table />
        </div>
    );
}
