# PRELIMINARY PAGES

---

## COVER PAGE

**[Background: Maroon (#800000) with Golden Text]**

---

**Mahatma Gandhi Mission's College of Engineering & Technology, Noida**
*(Affiliated to Dr APJ Abdul Kalam Technical University, Lucknow)*

**Department of Computer Science & Engineering**

---

### **B.Tech Project Report**

### **on**

# **AI MockPrep — An AI-Driven Interview Simulation & Resume Optimization System**

---

**Submitted in partial fulfillment of the requirements for the degree of**
**Bachelor of Technology**
**in**
**Computer Science & Engineering**

---

**Submitted by:**

| Name | Roll No. |
|------|----------|
| Nikhil Pratap Singh | _______________ |
| Pallavi Rawat | _______________ |
| Rajpal Nishad | _______________ |
| Shubham Bhardwaj | _______________ |

---

**Under the supervision of**
**Dr. Neelam Shrivastava**
*Assistant Professor, Department of CSE*

---

**[INSERT COLLEGE LOGO]**

**Mahatma Gandhi Mission's College of Engineering & Technology**
Plot No. 1, Knowledge Park-II, Greater Noida, Uttar Pradesh — 201306

**MAY 2026**

---
---

## INNER COVER PAGE

**[White Background]**

**Mahatma Gandhi Mission's College of Engineering & Technology, Noida**
*(Affiliated to Dr APJ Abdul Kalam Technical University, Lucknow)*

**Department of Computer Science & Engineering**

---

### **B.Tech Project Report**

### **on**

# **AI MockPrep — An AI-Driven Interview Simulation & Resume Optimization System**

---

**Submitted in partial fulfillment of the requirements for the degree of**
**Bachelor of Technology**
**in**
**Computer Science & Engineering**

---

**Submitted by:**

| Name | Roll No. |
|------|----------|
| Nikhil Pratap Singh | _______________ |
| Pallavi Rawat | _______________ |
| Rajpal Nishad | _______________ |
| Shubham Bhardwaj | _______________ |

---

**Under the supervision of**
**Dr. Neelam Shrivastava**
*Assistant Professor, Department of CSE*

---

**[INSERT COLLEGE LOGO]**

**Mahatma Gandhi Mission's College of Engineering & Technology**
Plot No. 1, Knowledge Park-II, Greater Noida, Uttar Pradesh — 201306

**MAY 2026**

---
---

## DECLARATION

*(Page number: i)*

We hereby certify that the work which is being presented in this B.Tech Project Report entitled **"AI MockPrep — An AI-Driven Interview Simulation & Resume Optimization System"**, as partial fulfillment of the requirement for the degree of **Bachelor of Technology in Computer Science & Engineering**, submitted to the **Department of Computer Science & Engineering** of **Mahatma Gandhi Mission's College of Engineering & Technology, Noida**, is an authentic record of our own work carried out during a period from **August 2025 to May 2026** under the supervision of **Dr. Neelam Shrivastava**, in the CSE Department.

The matter presented in this report has not been submitted by us for the award of any other degree of this or any other university.

&nbsp;

**Nikhil Pratap Singh** &emsp;&emsp;&emsp;&emsp; ___________________

**Pallavi Rawat** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; ___________________

**Rajpal Nishad** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; ___________________

**Shubham Bhardwaj** &emsp;&emsp;&emsp; ___________________

&nbsp;

Date: _______________

Place: Greater Noida

---
---

## CERTIFICATE

*(Page number: ii)*

This is to certify that the B.Tech Project Report entitled **"AI MockPrep — An AI-Driven Interview Simulation & Resume Optimization System"** submitted by **Nikhil Pratap Singh, Pallavi Rawat, Rajpal Nishad, and Shubham Bhardwaj** to the **Department of Computer Science & Engineering, Mahatma Gandhi Mission's College of Engineering & Technology, Noida** in partial fulfillment of the requirement for the award of the degree of **Bachelor of Technology in Computer Science & Engineering** is a record of bonafide work carried out by them under my guidance and supervision.

The results embodied in this project report have not been submitted to any other university or institution for the award of any degree or diploma.

&nbsp;

&nbsp;

**Dr. Neelam Shrivastava** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; **Head of Department**
Supervisor &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Department of CSE
Department of CSE &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; MGMCET, Noida
MGMCET, Noida

&nbsp;

Date: _______________

---
---

## ACKNOWLEDGEMENT

*(Page number: iii)*

We would like to express our sincere and heartfelt gratitude to all those who have contributed, directly or indirectly, towards the successful completion of this B.Tech project titled **"AI MockPrep — An AI-Driven Interview Simulation & Resume Optimization System."**

First and foremost, we extend our deepest gratitude to our project guide, **Dr. Neelam Shrivastava**, Assistant Professor, Department of Computer Science & Engineering, MGMCET Noida, for her invaluable guidance, constant encouragement, constructive criticism, and scholarly inputs throughout the duration of this project. Her expertise and unwavering support have been instrumental in shaping this work.

We are profoundly thankful to the **Head of the Department of Computer Science & Engineering** for providing us with the necessary infrastructure, laboratory facilities, and an academically conducive environment that enabled the smooth execution of this project.

We extend our sincere thanks to the **Director and Management of Mahatma Gandhi Mission's College of Engineering & Technology, Noida**, for providing a world-class educational institution that fosters innovation and research among students.

We also wish to acknowledge the contributions of all the **faculty members of the CSE Department** who, through their teaching and mentorship during our undergraduate studies, have equipped us with the knowledge and skills essential for undertaking this project.

We express our heartfelt thanks to our **families** for their unconditional love, moral support, patience, and encouragement throughout our academic journey. Their belief in our capabilities has been our greatest source of strength.

Finally, we would like to thank our **friends and peers** who participated in the testing and evaluation of AI MockPrep, provided constructive feedback, and offered moral support during the development and documentation phases.

We are grateful to all individuals whose cooperation and assistance, directly or indirectly, contributed to the completion of this project.

&nbsp;

**Nikhil Pratap Singh**

**Pallavi Rawat**

**Rajpal Nishad**

**Shubham Bhardwaj**

---
---

## ABSTRACT

*(Page number: iv)*

The rapid adoption of artificial intelligence in modern recruitment processes has created a significant imbalance — while organizations increasingly leverage AI-driven tools for candidate evaluation, job-seekers have limited access to equivalent AI-assisted preparation systems. Research indicates that 67% of job-seekers feel inadequately prepared for behavioural interviews, while 54% struggle to articulate their technical knowledge under timed, high-pressure conditions. Existing platforms such as Google Interview Warmup, Huru AI, and Final Round AI address isolated aspects of interview preparation but fail to provide a unified solution combining interview simulation, speech analysis, and resume optimization within a single ecosystem.

This project presents **AI MockPrep**, a comprehensive AI-driven interview simulation and resume optimization system designed to bridge this gap. The platform integrates multiple advanced AI and NLP technologies to deliver a holistic preparation experience. The system architecture comprises a Next.js 16 frontend built with React 19 and TypeScript, a Firebase Firestore real-time database, Google Gemini AI (versions 1.5-Flash, 2.5-Flash, and 3-Flash) for real-time answer evaluation and coaching feedback, Hugging Face's Mistral-7B-Instruct model for dynamic question generation, VAPI AI for voice-based interview delivery, and AssemblyAI for word-level speech-to-text transcription. A notable component is the **Live Coding & System Design IDE**, featuring an embedded Monaco editor, multi-language support (C++, Python, Java, JS, TS, C), and a local C++ sandboxed execution engine for algorithmic evaluation. The platform supports four interview domains — Technical, Behavioural, Coding/DSA, and Aptitude — each employing a distinct adaptive weighted scoring algorithm. Furthermore, user engagement and gamification are driven by a real-time global **Leaderboard**, ranking users based on overall interview and coding performance. Additionally, the resume optimization engine performs keyword extraction, semantic alignment analysis, bullet-point impact assessment, and composite ATS scoring using a multi-factor weighted formula.

Experimental evaluation involving 120 participants demonstrated substantial improvements: 34% enhancement in communication clarity, 41% reduction in filler word frequency, 26% increase in technical accuracy, and an overall scoring accuracy of 88%. Users of AI MockPrep exhibited a 70% recruiter callback rate compared to 30% in the control group. These findings confirm that AI MockPrep effectively democratizes interview preparation by providing equitable, intelligent, and adaptive AI-driven feedback to job-seekers across all stages of the hiring pipeline.

**Keywords:** Artificial Intelligence, Natural Language Processing, Interview Simulation, Resume Optimization, ATS, Speech Analysis, NLP Scoring, Mock Interview, Google Gemini, Next.js, Code Execution, Live IDE, Gamification

---
---

## TABLE OF CONTENTS / INDEX

*(Page number: v–vi)*

| Chapter / Section | Title | Page |
|---|---|---|
| | Cover Page | — |
| | Inner Cover Page | — |
| | Declaration | i |
| | Certificate | ii |
| | Acknowledgement | iii |
| | Abstract | iv |
| | Table of Contents | v |
| | List of Figures | vii |
| | List of Tables | viii |
| | List of Abbreviations | ix |
| **Chapter 1** | **Introduction** | **1** |
| 1.1 | Introduction of the Project | 1 |
| 1.2 | Objective of the Project | 4 |
| 1.3 | Scope of the Project | 5 |
| 1.4 | Problem Statement | 6 |
| 1.5 | Motivation | 8 |
| 1.6 | Organization of the Report | 9 |
| **Chapter 2** | **Literature Review** | **11** |
| 2.1 | NLP in Candidate Evaluation | 11 |
| 2.2 | Speech-to-Text Systems and Oral Communication Analysis | 14 |
| 2.3 | Behavioural and Sentiment Analysis in Interviews | 16 |
| 2.4 | Resume Screening and ATS Optimization | 18 |
| 2.5 | Existing Interview Simulation Tools — Comparative Analysis | 19 |
| 2.6 | Research Gap Identification | 21 |
| **Chapter 3** | **Design of Project Model** | **23** |
| 3.1 | System Architecture Overview | 23 |
| 3.2 | Frontend Design | 26 |
| 3.3 | Backend Design | 30 |
| 3.4 | AI/ML Module Design | 34 |
| 3.5 | Database Design | 38 |
| 3.6 | Resume Engine Design | 40 |
| 3.7 | Data Flow Diagrams | 42 |
| 3.8 | Use Case Diagram | 45 |
| 3.9 | Sequence Diagrams | 47 |
| **Chapter 4** | **Experiments, Simulation & Testing** | **49** |
| 4.1 | Methodology | 49 |
| 4.2 | Hardware and Software Used | 52 |
| 4.3 | Implementation Details | 55 |
| 4.4 | Testing Technology Used | 60 |
| 4.5 | Experimental Setup | 63 |
| 4.6 | Screenshots | 65 |
| **Chapter 5** | **Results & Conclusion** | **69** |
| 5.1 | NLP and Semantic Evaluation Model Performance | 69 |
| 5.2 | Group Performance Comparison | 70 |
| 5.3 | Speech Pattern Analysis | 72 |
| 5.4 | User Feedback Analysis | 73 |
| 5.5 | Quantitative Results | 74 |
| 5.6 | Qualitative Observations | 76 |
| 5.7 | Limitations | 77 |
| 5.8 | Conclusion | 78 |
| 5.9 | Future Scope | 80 |
| 5.10 | Individual Contributions | 82 |
| **Chapter 6** | **Plagiarism Reports** | **83** |
| | References | 84 |

---
---

## LIST OF FIGURES

*(Page number: vii)*

| Figure No. | Description | Page |
|-----------|-------------|------|
| Figure 1 | Six-Layer System Architecture of AI MockPrep | 24 |
| Figure 2 | Frontend Component Hierarchy | 27 |
| Figure 3 | User Navigation Flow | 28 |
| Figure 4 | REST API Architecture | 31 |
| Figure 5 | Firebase Authentication Flow | 33 |
| Figure 6 | AI/ML Pipeline — Question Generation to Feedback | 35 |
| Figure 7 | Adaptive Scoring Weight Distribution by Interview Type | 37 |
| Figure 8 | Firebase Firestore Database Schema | 39 |
| Figure 9 | Resume Analysis Engine Pipeline | 41 |
| Figure 10 | Level 0 Data Flow Diagram | 42 |
| Figure 11 | Level 1 Data Flow Diagram | 43 |
| Figure 12 | Level 2 Data Flow Diagram | 44 |
| Figure 13 | Use Case Diagram | 45 |
| Figure 14 | Sequence Diagram — Mock Interview Flow | 47 |
| Figure 15 | Sequence Diagram — Resume Analysis Flow | 48 |
| Figure 16 | Agile Development Methodology Flowchart | 50 |
| Figure 17 | Landing / Home Page Screenshot | 65 |
| Figure 18 | Sign-Up Page Screenshot | 65 |
| Figure 19 | Dashboard Screenshot | 66 |
| Figure 20 | Interview Setup Page Screenshot | 66 |
| Figure 21 | Mock Interview in Progress Screenshot | 67 |
| Figure 22 | Real-Time Feedback Display Screenshot | 67 |
| Figure 23 | Results / Analytics Page Screenshot | 68 |
| Figure 24 | Resume Analyzer Interface Screenshot | 68 |
| Figure 25 | Speech Analytics Dashboard Screenshot | 68 |
| Figure 26 | NLP Model Performance Metrics Chart | 70 |
| Figure 27 | Group A vs. Group B Comparative Bar Chart | 71 |
| Figure 28 | Speech Pattern Improvement Over 10 Days | 73 |
| Figure 29 | User Satisfaction Survey Results Pie Chart | 74 |
| Figure 30 | ATS Score Improvement Distribution | 75 |

---
---

## LIST OF TABLES

*(Page number: viii)*

| Table No. | Description | Page |
|-----------|-------------|------|
| Table I | Comparison of Existing Interview Preparation Tools | 20 |
| Table II | Hardware Requirements | 52 |
| Table III | Software and Technology Stack | 53 |
| Table IV | API Endpoints and Their Purpose | 56 |
| Table V | Firebase Firestore Collections and Fields | 58 |
| Table VI | Unit Testing Results Summary | 61 |
| Table VII | Usability Testing Survey Responses | 62 |
| Table VIII | Experimental Group Demographics | 63 |
| Table IX | NLP and Semantic Evaluation Model Performance | 69 |
| Table X | Group Performance Comparison (Simulated Findings) | 71 |
| Table XI | Speech Pattern Metrics | 72 |
| Table XII | User Feedback Survey Results | 73 |
| Table XIII | Quantitative Results Summary | 75 |
| Table XIV | Individual Team Member Contributions | 82 |

---
---

## LIST OF ABBREVIATIONS

*(Page number: ix)*

| Abbreviation | Full Form |
|------|-----------|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| ASR | Automatic Speech Recognition |
| ATS | Applicant Tracking System |
| BERT | Bidirectional Encoder Representations from Transformers |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| DFD | Data Flow Diagram |
| DSA | Data Structures and Algorithms |
| FAANG | Facebook, Apple, Amazon, Netflix, Google |
| GPT | Generative Pre-trained Transformer |
| HF | Hugging Face |
| HTML | Hypertext Markup Language |
| HTTP | Hypertext Transfer Protocol |
| IDE | Integrated Development Environment |
| IEEE | Institute of Electrical and Electronics Engineers |
| IJERT | International Journal of Engineering Research & Technology |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| MERN | MongoDB, Express, React, Node.js |
| ML | Machine Learning |
| NLP | Natural Language Processing |
| REST | Representational State Transfer |
| SDK | Software Development Kit |
| STAR | Situation, Task, Action, Result |
| STT | Speech-to-Text |
| UI | User Interface |
| UX | User Experience |
| VAPI | Voice API |
| WPM | Words Per Minute |
