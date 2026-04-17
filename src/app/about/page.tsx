import { User, BookOpen, Mail } from 'lucide-react';
import { readFile } from 'fs/promises';
import path from 'path';
import MarkdownRenderer from '@/component/MarkdownRenderer';

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'about.md');
  const aboutContent = await readFile(filePath, 'utf-8');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Page header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{ color: '#cba6f7', backgroundColor: 'rgba(203,166,247,0.10)', border: '1px solid rgba(203,166,247,0.25)' }}
          >
            <User size={12} />
            Về tác giả
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#cdd6f4' }}>
            Về Tôi
          </h1>
          <p className="text-sm" style={{ color: '#6c7086' }}>
            Chia sẻ về con đường viết truyện và sáng tác của mình
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-5 sm:p-8"
          style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#cba6f7' }} />
            <BookOpen size={18} style={{ color: '#cba6f7' }} />
            <h2 className="text-base sm:text-lg font-bold" style={{ color: '#cdd6f4' }}>Về [Mèo mướp]</h2>
          </div>

          <MarkdownRenderer content={aboutContent} />

          {/* Quote block */}
          <div
            className="my-6 px-5 py-4 rounded-xl"
            style={{ backgroundColor: '#1e1e2e', borderLeft: '3px solid #cba6f7' }}
          >
            <p className="italic text-center text-xs sm:text-sm leading-relaxed" style={{ color: '#bac2de' }}>
              &ldquo;Tôi nghe tiếng gió vi vu thầm thì<br />
              Rằng rừng sâu có loài mèo say ngủ.<br />
              Mèo nằm lặng trong miền phiêu lưu cũ,<br />
              Khẽ lưu tên vào mộng mị thu du.&rdquo;
            </p>
          </div>

          <p className="text-center text-xs mb-8" style={{ color: '#a6adc8' }}>
            🌸 Cảm ơn bạn đã ghé thăm. Mong những trang chữ nơi đây có thể đồng hành cùng bạn, dù chỉ một đoạn đường ngắn ngủi.
          </p>

          {/* Contact section */}
          <div className="pt-6" style={{ borderTop: '1px solid #45475a' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#89b4fa' }} />
              <Mail size={16} style={{ color: '#89b4fa' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>Liên hệ</h3>
            </div>
            <p className="text-xs mb-5" style={{ color: '#a6adc8' }}>
              Nếu bạn có bất kỳ góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện,
              hãy đừng ngần ngại liên hệ với mình nhé!
            </p>
            <div className="text-center">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#cba6f7',
                  color: '#11111b',
                  boxShadow: '0 4px 16px rgba(203,166,247,0.25)',
                }}
              >
                <Mail size={15} />
                Liên hệ với mình
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
