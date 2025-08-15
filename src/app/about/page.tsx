import Navigation from "../../component/Navigation";
import { User, BookOpen, Target, Mail, Heart, Sparkles, Mountain, Ghost, Smile } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-16 md:pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <User size={48} className="text-blue-400" />
            <h1 className="text-sm font-bold text-white">Về Tôi</h1>
          </div>
          <p className="text-xs text-gray-300">
            Chia sẻ về con đường viết truyện và sáng tác của tôi
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-900 shadow-lg rounded-lg p-8 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={32} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white">Chào mừng bạn đến với Góc Truyện</h2>
            </div>
            
            <p className="text-gray-300 mb-4 text-xs">
              Xin chào! Tôi là một người yêu thích viết lách và sáng tác truyện. Góc Truyện này được tạo ra 
              để chia sẻ những câu chuyện, suy nghĩ và sáng tác văn học của tôi với các độc giả.
            </p>

            <p className="text-gray-300 mb-4 text-xs">
              Tôi bắt đầu viết truyện từ khi còn nhỏ, và qua nhiều năm, niềm đam mê này đã trở thành 
              một phần không thể thiếu trong cuộc sống của tôi. Mỗi câu chuyện đều chứa đựng những 
              cảm xúc, trải nghiệm và góc nhìn riêng của tôi về thế giới xung quanh.
            </p>

            <div className="flex items-center gap-3 mb-4 mt-8">
              <Heart size={24} className="text-red-400" />
              <h3 className="text-xs font-semibold text-white">Thể loại truyện yêu thích</h3>
            </div>
            <ul className="list-none text-gray-300 mb-6 space-y-3">
              <li className="flex items-center gap-3 text-xs">
                <Sparkles size={20} className="text-purple-400" />
                <span><strong>Huyền huyễn:</strong> Những câu chuyện về thế giới ma thuật và phép thuật</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <Mountain size={20} className="text-green-400" />
                <span><strong>Tiên hiệp:</strong> Truyện về tu tiên, tu luyện và thế giới tiên giới</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <Heart size={20} className="text-pink-400" />
                <span><strong>Tình cảm:</strong> Những câu chuyện tình yêu lãng mạn và cảm động</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <BookOpen size={20} className="text-blue-400" />
                <span><strong>Phiêu lưu:</strong> Hành trình khám phá và chinh phục</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <Ghost size={20} className="text-gray-400" />
                <span><strong>Kinh dị:</strong> Truyện ma, kinh dị với những tình tiết hồi hộp</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <Smile size={20} className="text-yellow-400" />
                <span><strong>Hài hước:</strong> Những câu chuyện vui nhộn, giải trí</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 mb-4">
              <Target size={24} className="text-green-400" />
              <h3 className="text-xs font-semibold text-white">Mục tiêu</h3>
            </div>
            <p className="text-gray-300 mb-4 text-xs">
              Tôi mong muốn tạo ra những câu chuyện có thể mang lại niềm vui, cảm hứng và 
              những giây phút thư giãn cho độc giả. Mỗi chương truyện đều được viết với 
              tâm huyết và sự cẩn thận, hy vọng có thể chạm đến trái tim của mọi người.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <Mail size={24} className="text-blue-400" />
              <h3 className="text-xs font-semibold text-white">Liên hệ</h3>
            </div>
            <p className="text-gray-300 mb-6 text-xs">
              Nếu bạn có bất kỳ góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện, 
              hãy đừng ngần ngại liên hệ với tôi. Tôi rất mong nhận được phản hồi từ các bạn!
            </p>

            <div className="text-center">
              <a 
                href="/contact"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-xs font-medium transition-colors duration-200"
              >
                <Mail size={20} />
                Liên hệ với tôi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
