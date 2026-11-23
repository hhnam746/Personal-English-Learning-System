import type { VocabularyInput } from '../types'
import type { TargetLanguage } from '@/lib/zustand/language.store'

export const STARTER_DECKS: Record<TargetLanguage, VocabularyInput[]> = {
  // 1. Tiếng Nhật (Japanese - JLPT N5)
  ja: [
    {
      term: '猫',
      language: 'ja',
      phoneticReading: 'ねこ (neko)',
      scriptType: 'Kanji',
      ipa: '/ne̞ko̞/',
      audioUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80',
      meanings: [
        {
          meaningVi: 'Con mèo',
          partOfSpeech: 'Danh từ',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'あそこに白い猫がいます。',
              sentenceVi: 'Ở đằng kia có một con mèo màu trắng.',
              clozeSentenceEn: 'あそこに白い________がいます。',
              clozeAnswer: '猫',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: '水',
      language: 'ja',
      phoneticReading: 'みず (mizu)',
      scriptType: 'Kanji',
      ipa: '/mi.zɯᵝ/',
      audioUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80',
      meanings: [
        {
          meaningVi: 'Nước (uống)',
          partOfSpeech: 'Danh từ',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: '水を一杯ください。',
              sentenceVi: 'Làm ơn cho tôi một cốc nước.',
              clozeSentenceEn: '________を一杯ください。',
              clozeAnswer: '水',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: '食べる',
      language: 'ja',
      phoneticReading: 'たべる (taberu)',
      scriptType: 'Động từ',
      ipa: '/ta.be̞.ɾɯᵝ/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Ăn',
          partOfSpeech: 'Động từ nhóm 2',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: '朝ご飯を食べます。',
              sentenceVi: 'Tôi ăn bữa sáng.',
              clozeSentenceEn: '朝ご飯を________ます。',
              clozeAnswer: '食べ',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: '友達',
      language: 'ja',
      phoneticReading: 'ともだち (tomodachi)',
      scriptType: 'Kanji',
      ipa: '/to̞.mo̞.da.t͡ɕi/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Bạn bè',
          partOfSpeech: 'Danh từ',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: '友達と映画を見ました。',
              sentenceVi: 'Tôi đã xem phim cùng với bạn bè.',
              clozeSentenceEn: '________と映画を見ました。',
              clozeAnswer: '友達',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: '日本語',
      language: 'ja',
      phoneticReading: 'にほんご (nihongo)',
      scriptType: 'Kanji',
      ipa: '/ɲi.ho̞ŋ.ɡo̞/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Tiếng Nhật',
          partOfSpeech: 'Danh từ',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: '毎日日本語を勉強します。',
              sentenceVi: 'Mỗi ngày tôi đều học tiếng Nhật.',
              clozeSentenceEn: '毎日________を勉強します。',
              clozeAnswer: '日本語',
              clozeConfirmed: true
            }
          ]
        }
      ]
    }
  ],

  // 2. Tiếng Tây Ban Nha (Spanish)
  es: [
    {
      term: 'corazón',
      language: 'es',
      phoneticReading: 'ko-ra-ˈθon',
      scriptType: 'Latin',
      ipa: '/ko.ɾaˈθon/',
      audioUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=80',
      meanings: [
        {
          meaningVi: 'Trái tim, tấm lòng',
          partOfSpeech: 'Sustantivo masculino',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Tiene un corazón muy generoso.',
              sentenceVi: 'Anh ấy có một trái tim rất hào phóng.',
              clozeSentenceEn: 'Tiene un ________ muy generoso.',
              clozeAnswer: 'corazón',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'amigo',
      language: 'es',
      phoneticReading: 'a-ˈmi-ɣo',
      scriptType: 'Latin',
      ipa: '/aˈmi.ɣo/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Bạn bè (bạn nam)',
          partOfSpeech: 'Sustantivo masculino',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Él es mi mejor amigo.',
              sentenceVi: 'Cậu ấy là người bạn thân nhất của tôi.',
              clozeSentenceEn: 'Él es mi mejor ________.',
              clozeAnswer: 'amigo',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'gracias',
      language: 'es',
      phoneticReading: 'ˈɡɾa-θjas',
      scriptType: 'Latin',
      ipa: '/ˈɡɾa.θjas/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Cảm ơn',
          partOfSpeech: 'Interjección',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Muchas gracias por tu ayuda.',
              sentenceVi: 'Cảm ơn bạn rất nhiều vì sự giúp đỡ.',
              clozeSentenceEn: 'Muchas ________ por tu ayuda.',
              clozeAnswer: 'gracias',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'aprender',
      language: 'es',
      phoneticReading: 'a-pɾen-ˈdeɾ',
      scriptType: 'Latin',
      ipa: '/a.pɾenˈdeɾ/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Học hỏi, tiếp thu kiến thức',
          partOfSpeech: 'Verbo',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Quiero aprender español todos los días.',
              sentenceVi: 'Tôi muốn học tiếng Tây Ban Nha mỗi ngày.',
              clozeSentenceEn: 'Quiero ________ español todos los días.',
              clozeAnswer: 'aprender',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'familia',
      language: 'es',
      phoneticReading: 'fa-ˈmi-lja',
      scriptType: 'Latin',
      ipa: '/faˈmi.lja/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Gia đình',
          partOfSpeech: 'Sustantivo femenino',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Mi familia vive en Madrid.',
              sentenceVi: 'Gia đình tôi sống ở Madrid.',
              clozeSentenceEn: 'Mi ________ vive en Madrid.',
              clozeAnswer: 'familia',
              clozeConfirmed: true
            }
          ]
        }
      ]
    }
  ],

  // 3. Tiếng Ý (Italian)
  it: [
    {
      term: 'bellezza',
      language: 'it',
      phoneticReading: 'bel-ˈlet-tsa',
      scriptType: 'Latin',
      ipa: '/belˈlet.tsa/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Vẻ đẹp, nét đẹp',
          partOfSpeech: 'Sostantivo femminile',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'La bellezza di Roma è unica al mondo.',
              sentenceVi: 'Vẻ đẹp của thành Rome là độc nhất trên thế giới.',
              clozeSentenceEn: 'La ________ di Roma è unica al mondo.',
              clozeAnswer: 'bellezza',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'città',
      language: 'it',
      phoneticReading: 'tʃit-ˈta',
      scriptType: 'Latin',
      ipa: '/tʃitˈta/',
      audioUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&auto=format&fit=crop&q=80',
      meanings: [
        {
          meaningVi: 'Thành phố',
          partOfSpeech: 'Sostantivo femminile',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Firenze è una città meravigliosa.',
              sentenceVi: 'Florence là một thành phố tuyệt vời.',
              clozeSentenceEn: 'Firenze è una ________ meravigliosa.',
              clozeAnswer: 'città',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'grazie',
      language: 'it',
      phoneticReading: 'ˈɡrat-tsje',
      scriptType: 'Latin',
      ipa: '/ˈɡrat.tsje/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Cảm ơn',
          partOfSpeech: 'Interiezione',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Grazie mille per il tuo supporto.',
              sentenceVi: 'Cảm ơn bạn rất nhiều vì đã ủng hộ.',
              clozeSentenceEn: '________ mille per il tuo supporto.',
              clozeAnswer: 'Grazie',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'studiare',
      language: 'it',
      phoneticReading: 'stu-ˈdja-re',
      scriptType: 'Latin',
      ipa: '/stuˈdja.re/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Học tập, nghiên cứu',
          partOfSpeech: 'Verbo',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Mi piace studiare la lingua italiana.',
              sentenceVi: 'Tôi thích học tiếng Ý.',
              clozeSentenceEn: 'Mi piace ________ la lingua italiana.',
              clozeAnswer: 'studiare',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'amore',
      language: 'it',
      phoneticReading: 'a-ˈmo-re',
      scriptType: 'Latin',
      ipa: '/aˈmo.re/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Tình yêu',
          partOfSpeech: 'Sostantivo maschile',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'L\'amore vince sempre.',
              sentenceVi: 'Tình yêu luôn chiến thắng.',
              clozeSentenceEn: 'L\'________ vince sempre.',
              clozeAnswer: 'amore',
              clozeConfirmed: true
            }
          ]
        }
      ]
    }
  ],

  // 4. Tiếng Anh (English)
  en: [
    {
      term: 'resilient',
      language: 'en',
      phoneticReading: null,
      scriptType: 'Latin',
      ipa: '/rɪˈzɪl.i.ənt/',
      audioUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
      meanings: [
        {
          meaningVi: 'Kiên cường, có khả năng phục hồi nhanh',
          partOfSpeech: 'Adjective',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'She remained resilient in the face of adversity.',
              sentenceVi: 'Cô ấy vẫn kiên cường khi đối mặt với nghịch cảnh.',
              clozeSentenceEn: 'She remained ________ in the face of adversity.',
              clozeAnswer: 'resilient',
              clozeConfirmed: true
            }
          ]
        }
      ]
    },
    {
      term: 'serendipity',
      language: 'en',
      phoneticReading: null,
      scriptType: 'Latin',
      ipa: '/ˌser.ənˈdɪp.ə.ti/',
      audioUrl: null,
      meanings: [
        {
          meaningVi: 'Sự may mắn bất ngờ, tình cờ gặp điều tốt lành',
          partOfSpeech: 'Noun',
          ipaOverride: null,
          examples: [
            {
              sentenceEn: 'Finding this book was pure serendipity.',
              sentenceVi: 'Tìm thấy cuốn sách này quả là sự may mắn tình cờ.',
              clozeSentenceEn: 'Finding this book was pure ________.',
              clozeAnswer: 'serendipity',
              clozeConfirmed: true
            }
          ]
        }
      ]
    }
  ]
}
