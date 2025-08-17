'use client';

import { User, BookOpen, Sparkles, Heart, Target, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center">
            <div className="relative mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <User size={24} className="text-blue-400" />
                Về Tôi
              </h1>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              Chia sẻ về con đường viết truyện và sáng tác của mình
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-900/50 shadow-lg rounded-md p-4 sm:p-6 border border-gray-700 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-1.5 h-3 bg-blue-500 rounded-full"></div>
              <BookOpen size={20} className="text-blue-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">Về [Mèo mướp]</h2>
            </div>
            
            <div className="text-gray-300 space-y-3 text-xs">
              <p>
                Xin chào, mình là <span className="text-blue-400 font-medium">[Mèo mướp]</span>.
              </p>
              <p>
                Mình viết truyện như một cách lưu giữ những xúc cảm khó nói thành lời. Ở đây, mỗi con chữ là một nhịp thở, mỗi câu chuyện là một miền mơ nơi trái tim có thể an trú.
              </p>
              <p>
                Từ những ngày đầu tập tành viết trên Wattpad, mình đã tìm thấy niềm vui khi được sẻ chia cùng bạn đọc. Và giờ, mình chọn xây dựng góc nhỏ này — một nơi yên tĩnh hơn, riêng tư hơn, nơi những dòng chữ có thể tự do cất tiếng.
              </p>
              <p>
                Với mình, viết là một hành trình. Hành trình ấy có khi dịu dàng như mưa, có khi chênh vênh như gió, nhưng luôn mang theo một niềm tin: câu chuyện chân thành sẽ luôn tìm được người đồng cảm.
              </p>
              
              <div className="bg-gray-800/30 p-3 rounded-md border-l-2 border-purple-400 my-4">
                <p className="italic text-center text-purple-300">
                  "Tôi nghe tiếng gió vi vu thầm thì<br/>
                  Rằng rừng sâu có loài mèo say ngủ.<br/>
                  Mèo nằm lặng trong miền phiêu lưu cũ,<br/>
                  Khẽ lưu tên vào mộng mị thu du."
                </p>
              </div>
              
              <p className="text-center">
                🌸 <span className="text-pink-300">Cảm ơn bạn đã ghé thăm. Mong những trang chữ nơi đây có thể đồng hành cùng bạn, dù chỉ một đoạn đường ngắn ngủi.</span>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <Mail size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Liên hệ</h3>
              </div>
              <p className="text-gray-300 mb-4 text-xs">
                Nếu bạn có bất kỳ góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện, 
                hãy đừng ngần ngại liên hệ với mình nhé!
              </p>

              <div className="text-center">
                <a 
                  href="/contact"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-102"
                >
                  <Mail size={16} />
                  Liên hệ với mình
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
