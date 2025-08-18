'use client';

import { User, BookOpen, Sparkles, Heart, Target, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center">
            <div className="relative mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-[#FFFFFF] mb-2 leading-tight flex items-center justify-center gap-2">
                <User size={24} className="text-[#FF4081]" />
                Về Tôi
              </h1>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FFEB3B] rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs sm:text-sm text-[#B0BEC5]">
              Chia sẻ về con đường viết truyện và sáng tác của mình
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#FF4081] shadow-[0_0_8px_#FF4081] backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-1.5 h-3 bg-[#FF4081] rounded-full"></div>
              <BookOpen size={20} className="text-[#FF4081]" />
              <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF]">Về [Mèo mướp]</h2>
            </div>
            
            <div className="text-[#B0BEC5] space-y-3 text-xs">
              <p>
                Xin chào, mình là <span className="text-[#FF4081] font-medium">[Mèo mướp]</span>.
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
              
              <div className="bg-[#2A2A2A] p-3 rounded-lg border-l-4 border-[#FF4081] my-4">
                <p className="italic text-center text-[#FF4081]">
                  "Tôi nghe tiếng gió vi vu thầm thì<br/>
                  Rằng rừng sâu có loài mèo say ngủ.<br/>
                  Mèo nằm lặng trong miền phiêu lưu cũ,<br/>
                  Khẽ lưu tên vào mộng mị thu du."
                </p>
              </div>
              
              <p className="text-center">
                🌸 <span className="text-[#FF4081]">Cảm ơn bạn đã ghé thăm. Mong những trang chữ nơi đây có thể đồng hành cùng bạn, dù chỉ một đoạn đường ngắn ngủi.</span>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#FF4081]/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-1.5 h-1.5 bg-[#FF4081] rounded-full"></div>
                <Mail size={18} className="text-[#FF4081]" />
                <h3 className="text-sm font-semibold text-[#FFFFFF]">Liên hệ</h3>
              </div>
              <p className="text-[#B0BEC5] mb-4 text-xs">
                Nếu bạn có bất kỳ góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện, 
                hãy đừng ngần ngại liên hệ với mình nhé!
              </p>

              <div className="text-center">
                <a 
                  href="/contact"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-[#FF4081] hover:bg-[#FF4081]/92 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-102"
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
