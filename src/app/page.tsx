import Navigation from "../component/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Chào mừng đến với Góc Truyện của Tôi
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4 sm:px-0">
            Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học của tôi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link 
              href="/stories" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base sm:text-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              📚 Đọc Truyện của Tôi
            </Link>
            <button className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md text-base sm:text-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md">
              👤 Về Tôi
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
