import type { SpiritualCategory } from '../types';

export const SPIRITUAL_PATHWAYS: SpiritualCategory[] = [
    {
        id: 'ruh',
        title: 'The Spirit',
        arabicTitle: 'Rūḥ',
        description: 'Awaken transcendence, submission, and Divine connection.',
        longDescription: 'These surahs illuminate the spirit, teaching man who his Lord is and how to return to Him purified. They speak directly to the soul — about origin, purpose, eternity, and meeting Allah.',
        keywords: ['Oneness', 'Worship', 'Transcendence', 'Mercy', 'Revelation', 'Resurrection'],
        icon: '🌌',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        surahs: [
            { 
                number: 1, 
                name: 'Al-Fātiḥah', 
                englishName: 'The Opening', 
                description: 'The essence of guidance and the cornerstone of daily presence.', 
                tags: ['Meccan'],
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                readingContent: `Al-Fatihah, "The Opening," is the most profound dialogue between the Creator and the created. It is often referred to as the 'Mother of the Book' because it contains the entire message of the Quran in seven short verses.

Historical Context:
Revealed in Mecca, this Surah was established as a pillar of prayer from the earliest days of Islam.

Spiritual Dimensions:
1. Praise (Hamd): Recognizing that all beauty and perfection belongs to Allah.
2. Ownership: Reminding the spirit that He is the Lord of all worlds (Rabbi al-'alamin).
3. The Path: The request for guidance to the 'Straight Path' is the soul's most desperate plea for stability in a chaotic world.

Reflection:
When you recite "It is You we worship and You we ask for help," you are surrendering your ego's illusion of independence and reconnecting with your true Source.`
            },
            { 
                number: 6, 
                name: 'Al-An‘ām', 
                englishName: 'The Cattle', 
                description: 'Deepening monotheism through the signs of the universe.', 
                tags: ['Meccan'],
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                readingContent: `Surah Al-An'am is a powerful intellectual and spiritual journey through the creation of Allah. It addresses those who doubt the Unseen by pointing to the visible wonders of the world.

Key Themes:
- The Unity of Allah: Proving through reason and nature that there is only one Creator.
- Prophethood: The role of messengers in bringing the soul back to its natural state (Fitra).
- Life and Death: Reframing existence as a temporary school for the eternal spirit.

Aesthetic Note:
This Surah was revealed all at once, accompanied by thousands of angels, signifying its immense weight in establishing the core foundation of belief.`
            },
            { number: 7, name: 'Al-A‘rāf', englishName: 'The Heights', description: 'Revelation & Prophets.', tags: ['Meccan'] },
            { number: 10, name: 'Yūnus', englishName: 'Jonah', description: 'Faith in Unseen.', tags: ['Meccan'] },
            { number: 11, name: 'Hūd', englishName: 'Hud', description: 'Steadfastness.', tags: ['Meccan'] },
            { number: 12, name: 'Yūsuf', englishName: 'Joseph', description: 'Divine Providence.', tags: ['Meccan'] },
            { number: 14, name: 'Ibrāhīm', englishName: 'Abraham', description: 'Gratitude to the Creator.', tags: ['Meccan'] },
            { number: 16, name: 'An-Naḥl', englishName: 'The Bee', description: 'Blessings of Creation.', tags: ['Meccan'] },
            { number: 18, name: 'Al-Kahf', englishName: 'The Cave', description: 'Faith under Trial.', tags: ['Meccan'] },
            { number: 19, name: 'Maryam', englishName: 'Mary', description: 'Purity and Miracles.', tags: ['Meccan'] },
            { number: 20, name: 'Ṭāhā', englishName: 'Ta-Ha', description: 'Prophethood & Revelation.', tags: ['Meccan'] },
            { number: 23, name: 'Al-Mu’minūn', englishName: 'The Believers', description: 'Faithful Souls.', tags: ['Meccan'] },
            { number: 36, name: 'Yā-Sīn', englishName: 'Ya-Sin', description: 'The Heart (Life & Death).', tags: ['Meccan'] },
            { number: 39, name: 'Az-Zumar', englishName: 'The Troops', description: 'Sincerity & Return.', tags: ['Meccan'] },
            { number: 40, name: 'Ghāfir', englishName: 'The Forgiver', description: 'Forgiveness.', tags: ['Meccan'] },
            { number: 50, name: 'Qāf', englishName: 'Qaf', description: 'Resurrection.', tags: ['Meccan'] },
            { number: 55, name: 'Ar-Raḥmān', englishName: 'The Beneficent', description: 'Divine Mercy.', tags: ['Medinan'] },
            { number: 56, name: 'Al-Wāqi‘ah', englishName: 'The Inevitable', description: 'Afterlife Realities.', tags: ['Meccan'] },
            { number: 57, name: 'Al-Ḥadīd', englishName: 'The Iron', description: 'Strength.', tags: ['Medinan'] },
            { number: 67, name: 'Al-Mulk', englishName: 'The Sovereignty', description: 'Dominion.', tags: ['Meccan'] },
            { number: 76, name: 'Al-Insān', englishName: 'The Man', description: 'Purpose.', tags: ['Medinan'] },
            { number: 87, name: 'Al-A‘lā', englishName: 'The Most High', description: 'Exaltation.', tags: ['Meccan'] },
            { number: 97, name: 'Al-Qadr', englishName: 'The Power', description: 'Night of Power.', tags: ['Meccan'] },
            { number: 112, name: 'Al-Ikhlāṣ', englishName: 'The Sincerity', description: 'Oneness.', tags: ['Meccan'] },
            { number: 113, name: 'Al-Falaq', englishName: 'The Daybreak', description: 'Refuge.', tags: ['Meccan'] },
            { number: 114, name: 'An-Nās', englishName: 'The Mankind', description: 'Protection.', tags: ['Meccan'] },
        ]
    },
    {
        id: 'qalb',
        title: 'The Heart',
        arabicTitle: 'Qalb',
        description: 'Emotion, morality, compassion, and purification.',
        longDescription: 'These surahs polish the heart, transforming emotion into worship and compassion into strength. They deal with love, fear, hope, and purification.',
        keywords: ['Patience', 'Forgiveness', 'Light', 'Compassion', 'Humility', 'Sincerity'],
        icon: '❤️',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        surahs: [
            { number: 2, name: 'Al-Baqarah', englishName: 'The Cow', description: 'Faith & Obedience.', tags: ['Medinan'] },
            { number: 3, name: 'Āli ‘Imrān', englishName: 'Family of Imran', description: 'Trust & Unity.', tags: ['Medinan'] },
            { number: 13, name: 'Ar-Ra‘d', englishName: 'The Thunder', description: 'Change from Within.', tags: ['Medinan'] },
            { number: 15, name: 'Al-Ḥijr', englishName: 'The Rocky Tract', description: 'Protection & Faith.', tags: ['Meccan'] },
            { number: 24, name: 'An-Nūr', englishName: 'The Light', description: 'Social Morality.', tags: ['Medinan'] },
            { number: 25, name: 'Al-Furqān', englishName: 'The Criterion', description: 'Character.', tags: ['Meccan'] },
            { number: 28, name: 'Al-Qaṣaṣ', englishName: 'The Narrations', description: 'Divine Compassion.', tags: ['Meccan'] },
            { number: 29, name: 'Al-‘Ankabūt', englishName: 'The Spider', description: 'Faith Under Test.', tags: ['Meccan'] },
            { number: 31, name: 'Luqmān', englishName: 'Luqman', description: 'Wisdom & Family.', tags: ['Meccan'] },
            { number: 33, name: 'Al-Aḥzāb', englishName: 'The Combined Forces', description: 'Integrity.', tags: ['Medinan'] },
            { number: 35, name: 'Fāṭir', englishName: 'Originator', description: 'Humility.', tags: ['Meccan'] },
            { number: 42, name: 'Ash-Shūrā', englishName: 'Consultation', description: 'Harmony.', tags: ['Meccan'] },
            { number: 49, name: 'Al-Ḥujurāt', englishName: 'The Rooms', description: 'Brotherhood.', tags: ['Medinan'] },
            { number: 58, name: 'Al-Mujādilah', englishName: 'The Pleading Woman', description: 'Empathy & Justice.', tags: ['Medinan'] },
            { number: 59, name: 'Al-Ḥashr', englishName: 'The Exile', description: 'Unity of Believers.', tags: ['Medinan'] },
            { number: 60, name: 'Al-Mumtaḥanah', englishName: 'The Examined', description: 'Boundaries.', tags: ['Medinan'] },
            { number: 64, name: 'At-Taghābun', englishName: 'Mutual Disillusion', description: 'Accountability.', tags: ['Medinan'] },
            { number: 90, name: 'Al-Balad', englishName: 'The City', description: 'Compassion in Struggle.', tags: ['Meccan'] },
            { number: 92, name: 'Al-Lail', englishName: 'The Night', description: 'Choices of Heart.', tags: ['Meccan'] },
            { number: 93, name: 'Aḍ-Ḍuḥā', englishName: 'Morning Hours', description: 'Hope.', tags: ['Meccan'] },
            { number: 94, name: 'Ash-Sharḥ', englishName: 'Relief', description: 'Relief.', tags: ['Meccan'] },
            { number: 95, name: 'At-Tīn', englishName: 'The Fig', description: 'Dignity.', tags: ['Meccan'] },
            { number: 98, name: 'Al-Bayyinah', englishName: 'The Clear Proof', description: 'Clarity.', tags: ['Medinan'] },
            { number: 107, name: 'Al-Mā‘ūn', englishName: 'Small Kindnesses', description: 'Charity.', tags: ['Meccan'] },
            { number: 108, name: 'Al-Kawthar', englishName: 'Abundance', description: 'Abundance.', tags: ['Meccan'] },
        ]
    },
    {
        id: 'aql',
        title: 'The Intellect',
        arabicTitle: '‘Aql',
        description: 'Reflection, observation, reason, and wisdom.',
        longDescription: 'These surahs enlighten the intellect, training the mind to think with reverence and discern divine order. They form the intellectual dimension of the Qur’an.',
        keywords: ['Knowledge', 'Reflection', 'Purpose', 'Argument', 'Wisdom'],
        icon: '🧠',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        surahs: [
            { number: 4, name: 'An-Nisā’', englishName: 'The Women', description: 'Law & Justice.', tags: ['Medinan'] },
            { number: 5, name: 'Al-Mā’idah', englishName: 'The Table Spread', description: 'Ethics.', tags: ['Medinan'] },
            { number: 17, name: 'Al-Isrā’', englishName: 'The Night Journey', description: 'Responsibility.', tags: ['Meccan'] },
            { number: 26, name: 'Ash-Shu‘arā', englishName: 'The Poets', description: 'Language & Truth.', tags: ['Meccan'] },
            { number: 27, name: 'An-Naml', englishName: 'The Ant', description: 'Logic.', tags: ['Meccan'] },
            { number: 30, name: 'Ar-Rūm', englishName: 'The Romans', description: 'Signs in History.', tags: ['Meccan'] },
            { number: 32, name: 'As-Sajdah', englishName: 'The Prostration', description: 'Reflection.', tags: ['Meccan'] },
            { number: 38, name: 'Ṣād', englishName: 'Sad', description: 'Wisdom.', tags: ['Meccan'] },
            { number: 41, name: 'Fuṣṣilat', englishName: 'Explained in Detail', description: 'Explanation.', tags: ['Meccan'] },
            { number: 43, name: 'Az-Zukhruf', englishName: 'Ornaments of Gold', description: 'Deception of Wealth.', tags: ['Meccan'] },
            { number: 44, name: 'Ad-Dukhān', englishName: 'The Smoke', description: 'Reminders.', tags: ['Meccan'] },
            { number: 45, name: 'Al-Jāthiyah', englishName: 'The Crouching', description: 'Reason.', tags: ['Meccan'] },
            { number: 46, name: 'Al-Aḥqāf', englishName: 'Wind-Curved Sandhills', description: 'Historical Lessons.', tags: ['Meccan'] },
            { number: 47, name: 'Muḥammad', englishName: 'Muhammad', description: 'Ethics of Struggle.', tags: ['Medinan'] },
            { number: 52, name: 'Aṭ-Ṭūr', englishName: 'The Mount', description: 'Proof.', tags: ['Meccan'] },
            { number: 53, name: 'An-Najm', englishName: 'The Star', description: 'Revelation Validated.', tags: ['Meccan'] },
            { number: 54, name: 'Al-Qamar', englishName: 'The Moon', description: 'Historical Proofs.', tags: ['Meccan'] },
            { number: 65, name: 'Aṭ-Ṭalāq', englishName: 'The Divorce', description: 'Order & Law.', tags: ['Medinan'] },
            { number: 66, name: 'At-Taḥrīm', englishName: 'The Prohibition', description: 'Correction.', tags: ['Medinan'] },
            { number: 74, name: 'Al-Muddaththir', englishName: 'The Cloaked', description: 'Awakening Mind.', tags: ['Meccan'] },
            { number: 80, name: '‘Abasa', englishName: 'He Frowned', description: 'Awareness.', tags: ['Meccan'] },
            { number: 83, name: 'Al-Muṭaffifīn', englishName: 'The Defrauding', description: 'Ethics in Trade.', tags: ['Meccan'] },
            { number: 84, name: 'Al-Inshiqāq', englishName: 'The Sundering', description: 'Destiny.', tags: ['Meccan'] },
            { number: 89, name: 'Al-Fajr', englishName: 'The Dawn', description: 'History & Warning.', tags: ['Meccan'] },
        ]
    },
    {
        id: 'nafs',
        title: 'The Self',
        arabicTitle: 'Nafs',
        description: 'Struggle, purification, choice, and discipline.',
        longDescription: 'These surahs discipline the self, breaking illusions of pride and awakening sincerity. They guide toward mastery over the lower self.',
        keywords: ['Struggle', 'Purification', 'Choice', 'Deception', 'Repentance'],
        icon: '🔥',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        surahs: [
            { number: 8, name: 'Al-Anfāl', englishName: 'The Spoils', description: 'Struggle.', tags: ['Medinan'] },
            { number: 9, name: 'At-Tawbah', englishName: 'Repentance', description: 'Purification.', tags: ['Medinan'] },
            { number: 21, name: 'Al-Anbiyā’', englishName: 'The Prophets', description: 'Human Trials.', tags: ['Meccan'] },
            { number: 34, name: 'Saba’', englishName: 'Sheba', description: 'Arrogance.', tags: ['Meccan'] },
            { number: 37, name: 'As-Ṣāffāt', englishName: 'Aligned Ranks', description: 'Sincerity.', tags: ['Meccan'] },
            { number: 48, name: 'Al-Fatḥ', englishName: 'The Victory', description: 'Victory of Sincerity.', tags: ['Medinan'] },
            { number: 51, name: 'Adh-Dhāriyāt', englishName: 'Winnowing Winds', description: 'Purpose.', tags: ['Meccan'] },
            { number: 61, name: 'As-Ṣaff', englishName: 'The Ranks', description: 'Discipline.', tags: ['Medinan'] },
            { number: 63, name: 'Al-Munāfiqūn', englishName: 'Hypocrites', description: 'Hypocrisy.', tags: ['Medinan'] },
            { number: 71, name: 'Nūḥ', englishName: 'Noah', description: 'Perseverance.', tags: ['Meccan'] },
            { number: 72, name: 'Al-Jinn', englishName: 'The Jinn', description: 'Submission.', tags: ['Meccan'] },
            { number: 73, name: 'Al-Muzzammil', englishName: 'The Enshrouded', description: 'Preparation.', tags: ['Meccan'] },
            { number: 75, name: 'Al-Qiyāmah', englishName: 'Resurrection', description: 'Accountability.', tags: ['Meccan'] },
            { number: 77, name: 'Al-Mursalāt', englishName: 'The Emissaries', description: 'Consequence.', tags: ['Meccan'] },
            { number: 79, name: 'An-Nāzi‘āt', englishName: 'Those Who Drag', description: 'Death.', tags: ['Meccan'] },
            { number: 81, name: 'At-Takwīr', englishName: 'The Overthrowing', description: 'Reality Revealed.', tags: ['Meccan'] },
            { number: 82, name: 'Al-Infiṭār', englishName: 'The Cleaving', description: 'Reckoning.', tags: ['Meccan'] },
            { number: 85, name: 'Al-Burūj', englishName: 'Mansion of Stars', description: 'Endurance.', tags: ['Meccan'] },
            { number: 91, name: 'Ash-Shams', englishName: 'The Sun', description: 'Purification.', tags: ['Meccan'] },
            { number: 96, name: 'Al-‘Alaq', englishName: 'The Clot', description: 'Awakening.', tags: ['Meccan'] },
            { number: 99, name: 'Az-Zalzalah', englishName: 'The Earthquake', description: 'Accountability.', tags: ['Medinan'] },
            { number: 100, name: 'Al-‘Ādiyāt', englishName: 'The Courser', description: 'Devotion.', tags: ['Meccan'] },
            { number: 101, name: 'Al-Qāri‘ah', englishName: 'The Calamity', description: 'Shock of Truth.', tags: ['Meccan'] },
            { number: 102, name: 'At-Takāthur', englishName: 'Rivalry', description: 'Greed.', tags: ['Meccan'] },
            { number: 104, name: 'Al-Humazah', englishName: 'Traducer', description: 'Arrogance.', tags: ['Meccan'] },
            { number: 111, name: 'Al-Lahab', englishName: 'Palm Fiber', description: 'Destruction of Ego.', tags: ['Meccan'] },
        ]
    },
    {
        id: 'jasad',
        title: 'The Body',
        arabicTitle: 'Jasad',
        description: 'Justice, law, community, ethics, and responsibility.',
        longDescription: 'These surahs govern action, transforming faith into service and justice. They teach how the body acts as a servant to the soul.',
        keywords: ['Justice', 'Law', 'Community', 'Ethics', 'Worship'],
        icon: '⚙️',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        surahs: [
            { number: 22, name: 'Al-Ḥajj', englishName: 'The Pilgrimage', description: 'Worship & Unity.', tags: ['Medinan'] },
            { number: 62, name: 'Al-Jumu‘ah', englishName: 'The Congregation', description: 'Congregational Life.', tags: ['Medinan'] },
            { number: 105, name: 'Al-Fīl', englishName: 'The Elephant', description: 'Protection.', tags: ['Meccan'] },
            { number: 106, name: 'Quraysh', englishName: 'Quraysh', description: 'Economic Security.', tags: ['Meccan'] },
            { number: 109, name: 'Al-Kāfirūn', englishName: 'Disbelievers', description: 'Tolerance.', tags: ['Meccan'] },
            { number: 110, name: 'An-Naṣr', englishName: 'The Succour', description: 'Leadership.', tags: ['Medinan'] },
        ]
    }
];