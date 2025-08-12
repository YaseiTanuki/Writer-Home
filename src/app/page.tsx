import NavigationBar from "../component/NavigationBar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chào mừng đến với Góc Truyện của Tôi</h1>
          <p className="text-xl text-gray-600 mb-8">Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học của tôi</p>
          <div className="space-x-4">
            <Link href="/stories" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 transition-colors duration-200">
              Đọc Truyện của Tôi
            </Link>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200">
              Về Tôi
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
