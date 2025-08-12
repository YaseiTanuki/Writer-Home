export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Về Tôi</h1>
          <p className="text-lg text-gray-600">
            Chia sẻ về con đường viết truyện và sáng tác của tôi
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chào mừng bạn đến với Góc Truyện</h2>
            
            <p className="text-gray-700 mb-4">
              Xin chào! Tôi là một người yêu thích viết lách và sáng tác truyện. Góc Truyện này được tạo ra 
              để chia sẻ những câu chuyện, suy nghĩ và sáng tác văn học của tôi với các độc giả.
            </p>

            <p className="text-gray-700 mb-4">
              Tôi bắt đầu viết truyện từ khi còn nhỏ, và qua nhiều năm, niềm đam mê này đã trở thành 
              một phần không thể thiếu trong cuộc sống của tôi. Mỗi câu chuyện đều chứa đựng những 
              cảm xúc, trải nghiệm và góc nhìn riêng của tôi về thế giới xung quanh.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Thể loại truyện yêu thích</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Huyền huyễn:</strong> Những câu chuyện về thế giới ma thuật và phép thuật</li>
              <li><strong>Tiên hiệp:</strong> Truyện về tu tiên, tu luyện và thế giới tiên giới</li>
              <li><strong>Tình cảm:</strong> Những câu chuyện tình yêu lãng mạn và cảm động</li>
              <li><strong>Phiêu lưu:</strong> Hành trình khám phá và chinh phục</li>
              <li><strong>Kinh dị:</strong> Truyện ma, kinh dị với những tình tiết hồi hộp</li>
              <li><strong>Hài hước:</strong> Những câu chuyện vui nhộn, giải trí</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mục tiêu</h3>
            <p className="text-gray-700 mb-4">
              Tôi mong muốn tạo ra những câu chuyện có thể mang lại niềm vui, cảm hứng và 
              những giây phút thư giãn cho độc giả. Mỗi chương truyện đều được viết với 
              tâm huyết và sự cẩn thận, hy vọng có thể chạm đến trái tim của mọi người.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Liên hệ</h3>
            <p className="text-gray-700 mb-6">
              Nếu bạn có bất kỳ góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện, 
              hãy đừng ngần ngại liên hệ với tôi. Tôi rất mong nhận được phản hồi từ các bạn!
            </p>

            <div className="text-center">
              <a 
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200"
              >
                Liên hệ với tôi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
