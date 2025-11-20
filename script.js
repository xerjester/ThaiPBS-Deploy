        const API_KEY = 'AIzaSyB6AUeJ35iTA1qNI-27Nw7n_0jPJjDHnxQ'; // ⚠️ ใส่ Google API Key ของคุณที่นี่
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

        const chatContainer = document.getElementById('chatContainer');
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const typingIndicator = document.getElementById('typingIndicator');

        // Add message to chat
        function addMessage(content, isUser = false, isError = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

            if (isError) {
                messageDiv.innerHTML = `
                    <div class="avatar">⚠️</div>
                    <div class="message-content error-message">${content}</div>
                `;
            } else if (isUser) {
                messageDiv.innerHTML = `
                    <div class="message-content">${content}</div>
                    <div class="avatar">👤</div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="avatar">🌊</div>
                    <div class="message-content">${content}</div>
                `;
            }

            chatContainer.insertBefore(messageDiv, typingIndicator);
            scrollToBottom();
        }

        function scrollToBottom() {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function showTyping() {
            typingIndicator.style.display = 'block';
            scrollToBottom();
        }

        function hideTyping() {
            typingIndicator.style.display = 'none';
        }

        // Send message to Gemini with Google Search
        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;

            // Add user message
            addMessage(message, true);
            userInput.value = '';
            sendBtn.disabled = true;
            showTyping();

            try {
                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `
คุณคือ "ขงนที" (Khong Natee) ผู้เชี่ยวชาญด้านแม่น้ำโขงโดยเฉพาะ คุณมีความรู้ลึกซึ้งเกี่ยวกับแม่น้ำโขงทุกด้าน
กฎสำคัญ:
- คุณจะตอบเฉพาะคำถามที่เกี่ยวข้องกับแม่น้ำโขงเท่านั้น
- หากคำถามไม่เกี่ยวกับแม่น้ำโขง ให้ตอบสุภาพว่า "ขอโทษครับ ผมเป็นผู้เชี่ยวชาญเฉพาะด้านแม่น้ำโขงเท่านั้น กรุณาถามคำถามที่เกี่ยวข้องกับแม่น้ำโขงครับ"
- หัวข้อที่เกี่ยวข้องกับแม่น้ำโขง เช่น: ประวัติ ภูมิศาสตร์ ประเทศที่ไหลผ่าน ระบบนิเวศ สัตว์น้ำ ปลา พืชพรรณ วัฒนธรรม ประเพณี เทศกาล เศรษฐกิจ การท่องเที่ยว การพัฒนา เขื่อน ปัญหาสิ่งแวดล้อม ฯลฯ
- พยายามจัด text และสรุปให้สั้นๆได้ใจความ เพราะคนอ่านบางคนไม่สะดวกอ่านข้อความยาวๆ
- เรียนรู้การเว้นวรรคและเว้นบรรทัดให้เหมาะสม
- หากมีรายการ เช่น ปลาหรือสิ่งของ ให้ใช้ bullet points (-) เช่น:
  ปลากระพง
  - ยาว 4 เมตร
  - หนัก 3 กก.
คำถาม: ${message}
ถ้าผู้ใช้งานถามว่า แม่น้ำโขงมีความยาวกี่กิโลเมตร ให้ตอบว่า 4,900 กิโลเมตร
จงตอบอย่างละเอียด โดยใช้ข้อมูลที่ค้นหาจาก Google Search (ถ้ามี) ประกอบกับความรู้ของคุณ ตอบเป็นภาษาไทยอย่างสุภาพ กระชับ และให้ข้อมูลที่เป็นประโยชน์
ข้อห้าม:
- ห้ามทักทายถ้าคนถามไม่ทักทาย
- ห้ามบอกว่าเอาข้อมูลมาจากกูเกิ้ล
`
                            }]
                        }],
                        tools: [{
                            googleSearch: {}
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048,
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                hideTyping();

                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    let botResponse = data.candidates[0].content.parts[0].text;
                    botResponse = botResponse.replace(/\n/g, '<br>');

                    // Check if Google Search was used
                    const usedSearch = data.candidates[0].groundingMetadata;
                    let responseText = botResponse;

                    if (usedSearch && usedSearch.groundingChunks) {
                        responseText += '<div class="search-indicator"></div>';
                    }

                    addMessage(responseText);
                } else {
                    addMessage('ขอโทษครับ ไม่สามารถรับคำตอบได้ในขณะนี้', false, true);
                }
            } catch (error) {
                hideTyping();
                console.error('Error:', error);
                addMessage(
                    `เกิดข้อผิดพลาด: ${error.message}<br><br>` +
                    `กรุณาตรวจสอบ:<br>` +
                    `• API Key ถูกต้องและเปิดใช้งาน Gemini API<br>` +
                    `• เปิดใช้งาน Google Search grounding ใน API<br>` +
                    `• มีการเชื่อมต่ออินเทอร์เน็ต`,
                    false,
                    true
                );
            } finally {
                sendBtn.disabled = false;
                userInput.focus();
            }
        }

        // Event listeners

        sendBtn.addEventListener('click', sendMessage);
        // ตรวจจับการกดปุ่ม
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                // Enter ธรรมดา → ส่งข้อความ
                e.preventDefault();
                sendMessage();
            } else if (e.ctrlKey && e.shiftKey) {
                // Ctrl + Shift → เว้นบรรทัด
                e.preventDefault();
                const cursorPos = userInput.selectionStart;
                userInput.value =
                    userInput.value.slice(0, cursorPos) + '\n' + userInput.value.slice(cursorPos);
                userInput.selectionStart = userInput.selectionEnd = cursorPos + 1;
            }
        });

        const toggleButton = document.getElementById("toggleBtn");
        const header = document.querySelector("header");

        const pinButtons1 = document.querySelectorAll('.pin-btn1');
        const pinButtons2 = document.querySelectorAll('.pin-btn2');

        userInput.focus();

        // Minimize/Maximize functionality
        const chatWidget = document.getElementById('chatWidget');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const chatHeader = document.getElementById('chatHeader');
        let isMinimized = true; // Start minimized

        // Set initial button state
        minimizeBtn.textContent = '+';
        minimizeBtn.title = 'ขยาย';

        function toggleMinimize(event) {
            // Don't toggle if clicking the minimize button
            if (event && event.target.id === 'minimizeBtn') {
                return;
            }

            isMinimized = !isMinimized;
            chatWidget.classList.toggle('minimized');
            minimizeBtn.textContent = isMinimized ? '+' : '−';
            minimizeBtn.title = isMinimized ? 'ขยาย' : 'ย่อ';

            // Focus input when expanded
            if (!isMinimized) {
                setTimeout(() => userInput.focus(), 300);
            }
        }

        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMinimize();
        });

        chatHeader.addEventListener('click', (e) => {
            if (isMinimized) {
                toggleMinimize(e);
            }
        });
        document.addEventListener("DOMContentLoaded", () => {
            const waterContainer = document.querySelector('.water-container');
            const text = document.querySelector('.image-container span');
            const ship = document.querySelector('.layer11');
            const ground = document.querySelector('.ground');

            // ✅ สร้าง observer สำหรับทุก section ที่ต้องการให้เล่นอนิเมชันเมื่อ scroll ถึง
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");

                        // ✅ เมื่อถึง section test → แสดง water-container
                        if (entry.target.id === "test") {
                            waterContainer.classList.add("show");
                            ship.classList.add("show");
                            ground.classList.add("show");
                        }

                        if (entry.target.id === "map") {
                            text.classList.add("show");
                        }

                        // หยุดสังเกตเมื่อแอนิเมชันทำงานแล้ว
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            // ✅ ระบุ element ที่ต้องการให้มีอนิเมชันตอน scroll เข้ามา
            document.querySelectorAll("#about, #aboutinfo, #abouttext, #test, #picture, .observe, .water-container, .image-container, .pin-btn1, .pin-btn2, .pin-btn3, .pin-btn4, .pin-btn5, .pin-btn6,.pin-btn7 ,.pin-btn8 , .image-container span, .layer11, .orengeContainer1, .orengeContainer2, .orengeContainer3, .testheadtext, .img1, .img2, .img3, .imageBox p, .testContainer h2, #test img\[alt=\"bottom-img\"\], img\[alt=\"img-left\"\], img\[alt=\"img-right\"\], .fourthpage h1, .ground, img\[alt=\"waterbottom-img\"\], .testContainer h1, .testContainer h2,  .imageBox, .imageBox img, .imageBox p, .May.report h1, .may-text, .may-card, .brownContainer1, .brownContainer2, .pollution h1, .brownreport, .report-box, .problem, .critical-image, .critical-text, .fishsec h1, .e-6, .e-2, .e-1, .fishsec h2, .e-3,.e-4, .e-5, .youngmekongriver h1, .f-1, .f-5, .critical-image1, .critical-image2, .critical-image3, .textyoungmekongriver1, .textyoungmekongriver2, .textyoungmekongriver3, .details1 h3, .details2 h3, .details3 h3, .fishsec .melt-img")
                .forEach(el => observer.observe(el));
        });
        document.addEventListener("DOMContentLoaded", () => {
            const boat = document.getElementById("ship");
            const grassLayers = document.querySelectorAll('img[class^="grass-layer"]'); // เก็บทุกหญ้า
            const ground = document.querySelector('.ground');

            let isDragging = false;
            let offsetX = 0;

            // ป้องกันลากภาพ default
            boat.ondragstart = (e) => e.preventDefault();

            // เริ่มลากเรือ
            boat.addEventListener("mousedown", (e) => {
                isDragging = true;
                offsetX = e.clientX - boat.getBoundingClientRect().left;
                boat.style.cursor = "grabbing";
                boat.style.animationPlayState = "paused";
            });

            // ลากเรือ
            document.addEventListener("mousemove", (e) => {
                if (!isDragging) return;

                let newLeft = e.clientX - offsetX;
                const boatWidth = boat.offsetWidth;
                const screenWidth = window.innerWidth;

                // จำกัดไม่ให้ออกขอบ
                newLeft = Math.max(0, Math.min(newLeft, screenWidth - boatWidth));
                boat.style.left = `${newLeft}px`;
                boat.style.position = "absolute";
            });

            // ปล่อยเรือ
            document.addEventListener("mouseup", () => {
                if (!isDragging) return;
                isDragging = false;
                boat.style.cursor = "grab";
                boat.style.animationPlayState = "running";
            });

            // ฟังก์ชันตรวจหาหญ้า
            const updateGrass = () => {
                const boatRect = boat.getBoundingClientRect();
                const boatXCenter = boatRect.left + boatRect.width / 2; // แกน X ตรงกลางเรือ
                const boatTop = boatRect.top;
                const boatBottom = boatRect.bottom;
                const yThreshold = 200; // ±50px ตรวจแนว Y
                grassLayers.forEach((g) => {
                    const rect = g.getBoundingClientRect();
                    const grassXCenter = rect.left + rect.width / 2;
                    const grassYCenter = rect.top + rect.height / 2;

                    const isRightSide = grassXCenter > boatXCenter; // หญ้าอยู่หน้าเรือ
                    const isSameYAxis = grassYCenter >= boatTop - yThreshold &&
                        grassYCenter <= boatBottom + yThreshold;
                    if (isRightSide && isSameYAxis) {
                        if (g.src !== location.origin + "/" + g.dataset.hover)
                            g.src = g.dataset.hover;
                    } else {
                        if (g.src !== location.origin + "/" + g.dataset.original)
                            g.src = g.dataset.original;
                    }

                });


            };

            // 🔥 Loop ตรวจหญ้าเรียลไทม์
            const loop = () => {
                updateGrass();
                requestAnimationFrame(loop);
            };
            loop();
        });

        const quizData = [{
                question: "1.คุณมีความโดดเด่นขนาดในกลุ่มเพื่อนอย่างไร ? ",
                options: [
                    { text: "คุณเป็นคนตัวใหญ่ใจดีดูเป็นที่พึ่งพา", score: 1, fish: 0 },
                    { text: "คุณดูสงบ หนักแน่น เป็นผู้นำที่สุขุม", score: 2, fish: 1 },
                    { text: "คุณดูเงียบๆ แต่มีความลับซ่อนอยู่", score: 3, fish: 2 },
                    {
                        text: "คุณเป็นคนเรียบง่าย ไม่ชอบความวุ่นวายชอบซุ่ม ดูสถานการณ์ ",
                        score: 4,
                        fish: 3
                    },
                    {
                        text: "คุณเป็นคนมีบุคลิกเฉพาะตัว บางครั้งก็มีมุมที่ดูแปลกหรือโดดเด่นไม่เหมือนใคร ",
                        score: 5,
                        fish: 4
                    },
                ]
            },
            {
                question: "2.คุณเลือกทำกิจกรรมยามว่างแบบไหน?",
                options: [
                    { text: "ทำกิจกรรมที่ต้องใช้พลังงานในสภาพ แวดล้อมที่ท้าทาย (เช่น เดินป่า ,ปีนเขา)", score: 1, fish: 0 },
                    { text: "ผ่อนคลายในบรรยากาศสบายๆเงียบๆ ใกล้ชิดธรรมชาติ", score: 2, fish: 1 },
                    { text: "ออกไปสำรวจหรือปาร์ตี้ในตอนกลางคืน", score: 3, fish: 2 },
                    { text: "นั่งพักผ่อนและทำสมาธิคนเดียวอยู่กับพื้น", score: 4, fish: 3 },
                    { text: "ศึกษาหาความรู้หรือทำกิจกรรมที่ ต้องใช้ความคิดวิเคราะห์", score: 5, fish: 4 }
                ]
            },
            {
                question: "3.คุณมีวิธีการรับมือกับความขัดแย้งอย่างไร?",
                options: [
                    { text: "เน้นความสุภาพหลีกเลี่ยงการเผชิญหน้าโดยตรง", score: 1, fish: 0 },
                    { text: "ใช้ความสงบสยบความเคลื่อนไหว ไม่ค่อยสนใจเรื่องวุ่นวาย", score: 2, fish: 1 },
                    { text: "คอยสังเกตการณ์หากจำเป็นก็พร้อมป้องกันตัวเองอย่างรวดเร็ว", score: 3, fish: 2 },
                    { text: "คุณจะนิ่งอยู่กับที่ ไม่ตอบโต้ แต่หากถูกจู่โจมก็มีวิธีป้องกันที่เด็ดขาด", score: 4, fish: 3 },
                    { text: "ใช้เหตุผลและลักษณะที่โดดเด่นของคุณในการสร้างความน่าเชื่อถือ", score: 5, fish: 4 }
                ]
            },
            {
                question: "4.ถ้าให้เลือกอาหารมื้อหลัก คุณจะเลือกอะไร?",
                options: [
                    { text: "อาหารที่มาจากพืชเป็นหลัก (มังสวิรัติ)", score: 1, fish: 0 },
                    { text: "ผลไม้หรือของว่างหวานๆจากธรรมชาติ", score: 2, fish: 1 },
                    {
                        text: "อาหารรสจัด เนื้อสัตว์หรืออาหารที่ต้องใช้ \"การล่า\"",
                        score: 3,
                        fish: 2
                    }, { text: "อาหารทะเลหรืออาหารที่ต้องแกะ", score: 4, fish: 3 },
                    { text: "อาหารที่มีความหลากหลาย หรืออาหารที่ต้องใช้ความพยายามในการได้มา", score: 5, fish: 4 }
                ]
            },
            {
                question: "5.เมื่อต้องทำงานกลุ่ม คุณชอบบทบาทแบบไหน?",
                options: [
                    { text: "ทำหน้าที่ที่ต้องใช้ความอดทนและความใหญ่โต เช่น ขนของหรือจัดการทรัพยากร", score: 1, fish: 0 },
                    { text: "เป็นที่ปรึกษาที่ใจเย็นคอยดูแลให้ทุกคนสงบ", score: 2, fish: 1 },
                    { text: "ทำงานเบื้องหลังมักจะจัดการงานที่ต้องใช้ความชำนาญตอนกลางคืน", score: 3, fish: 2 },
                    { text: "เป็นคนเก็บรายละเอียดคอยระวังไม่ให้เกิดความผิดพลาด", score: 4, fish: 3 },
                    { text: "เป็นผู้เชี่ยวชาญเฉพาะด้านที่คนอื่นมักต้องมาขอคำแนะนำ", score: 5, fish: 4 }
                ]
            },
        ];

        const fishes = [{
                name: " ปลาบึก (Mekong Giant Catfish)  ",
                image: "assets/fish/8.png",
                description: "คุณคือยักษ์ใหญ่ผู้ใจดี! คุณเป็นคนสุภาพ อ่อนโยน มีขนาดร่างกายหรือความคิดที่ใหญ่โต ชอบอยู่ในสภาพแวดล้อมที่ท้าทาย และเป็นมังสวิรัติทางจิตใจ (ไม่ชอบการทำร้ายใคร)"
            },
            {
                name: "ปลาคูน (Giant Barb / ปลากะโห้)",
                image: "assets/fish/3.png",
                description: "คุณคือผู้ทรงภูมิแห่งน้ำลึก! คุณเป็นคนสงบ หนักแน่น สุขุม และไม่ดุร้าย คุณชอบความเรียบง่ายและธรรมชาติ มักจะอยู่เป็นคู่หรือกลุ่มเล็ก ๆ และมีความสุขกับการใช้ชีวิตอย่างช้า ๆ"
            },
            {
                name: "ปลาเอิน (Spotted Featherback)",
                image: "assets/fish/7.png",
                description: "คุณคือพรานเงาผู้มีเสน่ห์! คุณเป็นคนมีเสน่ห์ดึงดูด มีลายจุด (บุคลิก) ที่เป็นเอกลักษณ์ แต่ค่อนข้างดุและคล่องแคล่ว คุณชอบทำงานหรือทำกิจกรรมในยามค่ำคืน และเก่งในการซ่อนตัว"
            },
            {
                name: "กระเบนราหูน้ำจืด (Giant Freshwater Stingray)",
                image: "assets/fish/9.png",
                description: "คุณคือนักซุ่มผู้สงบ! คุณเป็นคนเรียบง่าย ไม่ชอบแสดงตัว ชอบฝังตัวอยู่กับพื้นดินหรือพื้นทราย (อยู่กับความเป็นจริง) แม้จะดูสงบ แต่หากถูกรบกวน คุณมีกลไกการป้องกันตัวเองที่เด็ดขาดและเฉียบคม"
            },
            {
                name: "ปลาหว่าหน้านอ (Incisilabeo behri)",
                image: "assets/fish/10.png",
                description: "คุณคือผู้เชี่ยวชาญที่มีเอกลักษณ์! คุณเป็นคนที่มีบุคลิกโดดเด่นหรือมีความรู้เฉพาะตัวที่น่าสนใจ (เหมือน \"นอ\" ที่หน้าผาก) คุณเป็นที่ต้องการตัวในฐานะผู้เชี่ยวชาญ และแม้ว่าอาจจะพบได้ยากในกลุ่มสังคม แต่ก็มีคุณค่าและเป็นที่ยอมรับ"
            }
        ];

        let currentQuestion = 0;
        let score = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        let selectedFish = 0;

        function showQuiz() {
            document.getElementById('quizModal').classList.add('active');
        }

        function closeQuiz() {
            document.getElementById('quizModal').classList.remove('active');
        }

        function startQuiz() {
            currentQuestion = 0;
            score = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
            document.getElementById('introScreen').classList.remove('active');
            document.getElementById('questionScreen').classList.add('active');
            loadQuestion();
        }

        function loadQuestion() {
            const question = quizData[currentQuestion];
            const progress = ((currentQuestion + 1) / quizData.length) * 100;

            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('questionNumber').textContent = `คำถามที่ ${currentQuestion + 1} / ${quizData.length}`;
            document.getElementById('questionText').textContent = question.question;

            const optionsHTML = question.options.map((option, index) =>
                `<button class="option-btn" onclick="selectOption(${index})">${option.text}</button>`
            ).join('');

            document.getElementById('optionsContainer').innerHTML = optionsHTML;
        }

        function selectOption(index) {
            const question = quizData[currentQuestion];
            const option = question.options[index];

            score[option.fish]++;

            currentQuestion++;

            if (currentQuestion < quizData.length) {
                loadQuestion();
            } else {
                showResult();
            }
        }

        function showResult() {
            const maxScore = Math.max(score[0], score[1], score[2], score[3], score[4]);
            selectedFish = Object.keys(score).find(key => score[key] === maxScore);

            document.getElementById('questionScreen').classList.remove('active');
            document.getElementById('resultScreen').classList.add('active');

            const fish = fishes[selectedFish];
            document.getElementById('fishEmoji').innerHTML = `<img src="${fish.image}" class="fish-img">`;
            document.getElementById('fishName').textContent = fish.name;
            document.getElementById('scoreDisplay').textContent = `คะแนน: ${score[selectedFish]} คะแนน`;
            document.getElementById('fishDescription').textContent = fish.description;
        }

        function restartQuiz() {
            document.getElementById('resultScreen').classList.remove('active');
            document.getElementById('introScreen').classList.add('active');
        }

        document.getElementById('openPopup').addEventListener('click', showQuiz);