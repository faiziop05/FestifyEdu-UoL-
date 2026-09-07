import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { HelpCircle, Shield, GraduationCap, Users, LayoutDashboard, Lock } from "lucide-react";
import styles from "../../styles/pages_css/HelpCenter.module.css";
import Header from "../../components/Header";

export default function HelpCenter() {
  const { user } = useSelector((state) => state.auth || {});
  const { pathname } = useLocation();
  const isAuthHelp = pathname.includes("/auth/help");
  
  // If not authenticated, assume Student (since students don't need accounts to take quizzes)
  const role = user?.role || "student";

  const getRoleConfig = () => {
    if (isAuthHelp) {
      return {
        title: "Login & Authentication Support",
        icon: <Lock size={24} />,
        summary: "Having trouble signing in? Find answers to common authentication problems here.",
        faqs: [
          {
            q: "I forgot my password. How do I reset it?",
            a: "If you are a Teacher or an Admin, you must contact your organization's superior. Teachers should ask their organization's Admin to reset their password. Admins should contact the Super Admin."
          },
          {
            q: "Why is my login failing with 'Invalid Credentials'?",
            a: "Double-check your email and password. Passwords are case-sensitive. If you recently had your password reset by an administrator, ensure you are using the new password exactly as provided."
          },
          {
            q: "I am a student. Do I need an account to join a quiz?",
            a: "No! Students do not need an account or a password to join a session. Click the 'Join a Classroom as Student' button on the login screen, and enter the 6-digit Room Code provided by your teacher."
          },
          {
            q: "My account says it is disabled or suspended.",
            a: "If your account has been suspended, please contact your organization's administrator immediately to resolve the issue and restore access."
          }
        ]
      };
    }

    switch (role) {
      case "super_admin":
        return {
          title: "Super Admin Support",
          icon: <Shield size={24} />,
          summary: "As a Super Admin, you have the highest level of access across the entire platform. You can create and manage global organizations, oversee all system administrators, create global datasets and quizzes, and monitor the entire system's health.",
          faqs: [
            {
              q: "How do I create a new Organization?",
              a: "Navigate to 'Manage Orgs' from the sidebar. Click 'Add Organization', enter the details including the allowed email domain (e.g., 'university.edu'), and save. Any teachers signing up with this domain will automatically be routed to this organization."
            },
            {
              q: "How do I assign an Admin to an organization?",
              a: "Go to the 'Manage Admins' tab. When adding a new Admin, you can select which Organization they are assigned to. Once created, they will be able to manage teachers within that organization."
            },
            {
              q: "What is the global Data Hub used for?",
              a: "The Data Hub allows you to upload datasets that can be shared globally across all organizations, or restricted to specific ones. Teachers can then use these datasets to build their quizzes."
            },
            {
              q: "Can I view the data of every organization?",
              a: "Yes. Super Admins have full read and write access to all organizations, teachers, classrooms, and datasets across the platform."
            },
            {
              q: "How do I permanently delete an organization?",
              a: "Go to 'Manage Orgs' and click the delete icon. Note: Deleting an organization will permanently erase all associated admins, teachers, classrooms, and student records. This action cannot be undone."
            }
          ]
        };
      case "admin":
        return {
          title: "Admin Support",
          icon: <LayoutDashboard size={24} />,
          summary: "As an Admin, you are responsible for managing your specific organization. You can add, remove, and monitor Teachers, as well as build and share standardized quizzes and datasets across your institution.",
          faqs: [
            {
              q: "How do I add a new Teacher?",
              a: "Navigate to the 'Manage Teachers' section and click 'Add Teacher'. Note that the teacher's email address MUST match your organization's registered domain name."
            },
            {
              q: "Can I share a quiz with all my teachers?",
              a: "Yes! When you create a quiz in the Quiz Builder, you can adjust its access settings in the Data Hub to be shared with teachers in your organization."
            },
            {
              q: "How do I reset a Teacher's password?",
              a: "On the 'Manage Teachers' page, find the teacher in the list, click the edit icon, enter a new password in the password field, and save the changes."
            },
            {
              q: "Can I temporarily disable a Teacher's account?",
              a: "Yes. In the Manage Teachers screen, you can change a teacher's status to 'suspended'. They will be unable to log in until their status is changed back to 'active'."
            },
            {
              q: "Are there limits to how many datasets my teachers can upload?",
              a: "Currently, there are no hard limits on the number of datasets. However, we recommend organizing them into folders or tagging them properly in the Data Hub to prevent clutter."
            }
          ]
        };
      case "teacher":
        return {
          title: "Teacher Support",
          icon: <GraduationCap size={24} />,
          summary: "As a Teacher, you can create interactive quizzes using real datasets, host live or scheduled sessions for your students, and monitor their performance in real-time.",
          faqs: [
            {
              q: "How do I build a new Quiz?",
              a: "Go to the 'Quiz Builder'. You must first select a Dataset from the sidebar (or upload your own in the Data Hub). Once a dataset is selected, you can add questions and define acceptable interactive charts."
            },
            {
              q: "How do I invite students to a live session?",
              a: "From your Dashboard, click 'Start Session' on any quiz. This will generate a unique 6-digit room code. Share this code with your students so they can join via the Student Join page."
            },
            {
              q: "Where can I see student grades?",
              a: "Navigate to the 'Student Performance' tab. Here you can see aggregate performance across all your sessions, or click on a specific student to see their detailed interaction history."
            },
            {
              q: "Can I reuse the same quiz multiple times?",
              a: "Absolutely. You can launch as many independent live sessions (Classrooms) from a single quiz as you want. Each session will generate a unique 6-digit room code and track its students separately."
            },
            {
              q: "What happens if I forget to end a live session?",
              a: "The system has an automated safety net. If a session is left running with an 'active' status for more than 3 hours, the server will automatically end the session and disconnect any remaining students."
            }
          ]
        };
      case "student":
      default:
        return {
          title: "Student Support",
          icon: <Users size={24} />,
          summary: "Welcome to the interactive learning platform! As a student, you can join live quiz sessions using a code provided by your teacher and interact with real datasets to answer questions.",
          faqs: [
            {
              q: "How do I join a quiz?",
              a: "You need a 6-digit Room Code from your teacher. Enter this code on the Join page, provide your name and Student ID, and wait for the teacher to start the session."
            },
            {
              q: "How do I answer chart questions?",
              a: "When a question requires you to build a chart, use the Data Explorer on the left side of your screen to select the correct X and Y axes, choose a chart type, and click 'Submit Chart'."
            },
            {
              q: "Can I review my past quizzes?",
              a: "Currently, you must be in an active session to view your scores. Your teacher has access to your full performance history and can provide detailed feedback."
            },
            {
              q: "What if I accidentally disconnect during a live quiz?",
              a: "Don't panic! Simply go back to the join page and enter the exact same 6-digit Room Code, Name, and Student ID. The system will recognize you and seamlessly reconnect you to your active session."
            },
            {
              q: "Can I change my answer after submitting it?",
              a: "Once you click 'Submit', the answer is locked in. Make sure you double-check your charts and multiple-choice selections before proceeding to the next question."
            }
          ]
        };
    }
  };

  const config = getRoleConfig();

  // If role is student or we are in auth help, we render a standalone page without the dashboard sidebar wrapper
  const isStandalone = role === "student" || isAuthHelp;

  return (
    <div style={{ height: isStandalone ? "100vh" : "100%", overflowY: "auto", backgroundColor: "var(--bg-main)" }}>
      {isStandalone && <Header variant="auth" />}
      
      <div className={styles.helpContainer}>
        <div className={styles.helpHeader}>
          <h1>How can we help?</h1>
          <p>Find answers to common questions and learn how to use the platform.</p>
        </div>

        <div className={styles.accessSummary}>
          <h2>{config.icon} {config.title}</h2>
          <p>{config.summary}</p>
        </div>

        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {config.faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <div className={styles.faqQuestion}>
                  <HelpCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{faq.q}</span>
                </div>
                <div className={styles.faqAnswer}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
