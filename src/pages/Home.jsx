
import SearchBar from "@/components/ui/searchbar"
import Button from "@/components/ui/button"

export default function Home() {


    const HomeSearchBar = () => (
        <div className="flex flex-col h-screen justify-center items-center">
            <SearchBar />
            <Button type="type3" href="#">Tra cứu</Button>

        </div>

    )
    const SearchButton = () => (
        <div>
        </div>
    )
    return (
        <>
            <div>This is Home</div>
            <HomeSearchBar />
            <SearchButton />
        </>

    )
}