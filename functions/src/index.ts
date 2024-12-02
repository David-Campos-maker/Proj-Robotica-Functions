import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa o Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

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