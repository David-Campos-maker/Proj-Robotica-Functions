import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa o Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Interface para alunos
interface Student {
  ra: string;
  course: string;
  name: string;
  photo_url: string;
}

// Interface para presenças
interface Attendance {
  attendance: boolean;
  date: string;
  student_ra: string;
}

export const registerAttendance = functions.https.onCall(async (data) => {
    const checkInDate = new Date(data.check_in);
    const checkOutDate = new Date(data.check_out);

    const differenceInMilliseconds = checkOutDate.getTime() - checkInDate.getTime();
    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

    const attendance: boolean = differenceInMinutes >= 20;

    const result = {
      attendance: attendance,
      student_ra: data.RA,
      date: data.date
    }

    try {
      const attendanceDocRef =  await db.collection('attendance').add(result)
      console.log("Document successfully written with ID:", attendanceDocRef.id);
      return attendanceDocRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
      throw new Error("Erro ao registrar a presença.");
    }
}); 

export const getStudentsAttendance = functions.https.onCall(async () => {
  try {
    // Obter dados de `students`
    const studentSnapshot = await db.collection("students").get();
    const students: Student[] = studentSnapshot.docs.map((doc) => ({
      ra: doc.data().RA,
      course: doc.data().course,
      name: doc.data().name,
      photo_url: doc.data().photo_url,
    }));

    // Para cada aluno, buscar suas presenças
    const studentsWithAttendances = await Promise.all(
      students.map(async (student) => {
        const attendanceSnapshot = await db
          .collection("attendance")
          .where("student_ra", "==", student.ra)
          .get();

        const attendances: Attendance[] = attendanceSnapshot.docs.map((doc) => ({
          attendance: doc.data().attendance,
          date: doc.data().date,
          student_ra: doc.data().student_ra,
        }));

        return { ...student, attendances };
      })
    );

    return studentsWithAttendances;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw new Error("Erro ao buscar alunos e presenças.");
  }
});