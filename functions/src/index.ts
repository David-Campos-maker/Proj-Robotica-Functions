import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa o Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

export const getStudents = functions.https.onRequest(async (req, res) => {
  try {
    // Acessa a coleção "students"
    const studentsSnapshot = await db.collection("students").get();

    // Verifica se existem documentos
    if (studentsSnapshot.empty) {
      res.status(404).send("Nenhum estudante encontrado.");
      return;
    }

    // Monta um array com os dados "name" e "RA" de cada documento
    const studentsData = studentsSnapshot.docs.map((doc) => {
      const { name, RA } = doc.data();
      return { name, RA };
    });

    // Retorna os dados no response
    res.status(200).json(studentsData);
  } catch (error) {
    console.error("Erro ao acessar a coleção 'students':", error);
    res.status(500).send("Erro ao acessar os dados dos estudantes.");
  }
});

export const registerAttendance = functions.https.onCall(async (data) => {
    console.log("Receiving: ", data);
  
    // Desestrutura os dados do objeto recebido
    const { RA, time, date } = data;
  
    // Verifica se a diferença é maior ou igual a 20 minutos
    const twentyMinutesInMs = 20 * 60 * 1000; // 20 minutos em milissegundos
    console.log("approved time: " , twentyMinutesInMs);
  
    // Checa e cria a mensagem apropriada
    if (time >= twentyMinutesInMs) {
      console.log(
        `Attendance for RA: ${RA}, Time: ${time}, Date: ${date} - Greater than or equal to 20 minutes`
      );
      return {
        message: `Attendance registered. RA: ${RA}, Time: ${time}, Date: ${new Date(
          date
        ).toISOString()} - More than or equal to 20 minutes.`,
      };
    } else {
      console.log(
        `Attendance for RA: ${RA}, Time: ${time}, Date: ${date} - Less than 20 minutes`
      );
      return {
        message: `Attendance rejected. RA: ${RA}, Time: ${time}, Date: ${new Date(
          date
        ).toISOString()} - Less than 20 minutes.`,
      };
    }
  });
  