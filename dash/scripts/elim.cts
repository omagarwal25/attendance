/* The following students are on the team:
om_agarwal@asl.org
jack_albrecht@asl.org
ayaan_ansari@asl.org
robi_arpaio@asl.org
trevon_ashton@asl.org
ian_beal@asl.org
blu_belinky@asl.org
leisha_bhatnagar@asl.org
Kingston_Bridges@asl.org
magnus_carson@asl.org
bia_caseiras@asl.org
chloe_cassidy@asl.org
siena_chae@asl.org
perry_chen@asl.org
konstantinos_dalglish@asl.org
gabi_dawson@asl.org
oskar_doepke@asl.org
noah_fernihough@asl.org
luca_filippa@asl.org
anabelle_fox@asl.org
yuval_fransis@asl.org
matthew_furst@asl.org
ryan_ganguli@asl.org
alexis_gerwe@asl.org
xavier_goff@asl.org
evan_golden@asl.org
daniel_gooch@asl.org
ela_gulener@asl.org
rowan_hamilton@asl.org
quinn_heskett@asl.org
lucy_Ilyas@asl.org
suchir_jindal@asl.org
campbell_lazar@asl.org
ian_leary@asl.org
steven_lewis@asl.org
christopher_lhuilier@asl.org
gio_limena@asl.org
sofia_limena@asl.org
joseph_lindner@asl.org
emma_lucas@asl.org
anderson_lugert@asl.org
emilierose_malota@asl.org
nikhil_mehta@asl.org
erika_novak@asl.org
scarlett_novak@asl.org
edward_odwyer@asl.org
clay_olson@asl.org
augi_ora@asl.org
eduardo_pilnik@asl.org
james_potchatek@asl.org
harshiv_puri@asl.org
zain_rafiq@asl.org
harrison_ryan_quy@asl.org
matteo_salloum@asl.org
sofia_salloum@asl.org
lamine_sao@asl.org
ishaan_sareen@asl.org
aadit_sengupta@asl.org
Vica_Sokoloff_Cortes@asl.org
haddy_soliman@asl.org
wes_taylor@asl.org
adi_tsonev@asl.org
yifei_yan@asl.org
shelbe_yousey@asl.org
*/

const { PrismaClient } = require("@prisma/client");

// any person on the database who isn't on this list should be purged

const prisma = new PrismaClient();

const calculateHoursFromListOfSessions = (sessions) => {
  const hours = sessions.reduce((acc, session) => {
    if (!session.endAt) return acc;

    const diff = session.endAt.getTime() - session.startAt.getTime();
    const hours = diff / 1000 / 60 / 60;
    return acc + hours;
  }, 0);
  return hours;
};


async function main() {
  const students = [
    "om_agarwal@asl.org",
    "jack_albrecht@asl.org",
    "ayaan_ansari@asl.org",
    "robi_arpaio@asl.org",
    "trevon_ashton@asl.org",
    "ian_beal@asl.org",
    "blu_belinky@asl.org",
    "leisha_bhatnagar@asl.org",
    "Kingston_Bridges@asl.org",
    "magnus_carson@asl.org",
    "bia_caseiras@asl.org",
    "chloe_cassidy@asl.org",
    "siena_chae@asl.org",
    "perry_chen@asl.org",
    "konstantinos_dalglish@asl.org",
    "gabi_dawson@asl.org",
    "oskar_doepke@asl.org",
    "noah_fernihough@asl.org",
    "luca_filippa@asl.org",
    "yuval_fransis@asl.org",
    "matthew_furst@asl.org",
    "ryan_ganguli@asl.org",
    "alexis_gerwe@asl.org",
    "xavier_goff@asl.org",
    "evan_golden@asl.org",
    "daniel_gooch@asl.org",
    "ela_gulener@asl.org",
    "rowan_hamilton@asl.org",
    "quinn_heskett@asl.org",
    "lucy_Ilyas@asl.org",
    "suchir_jindal@asl.org",
    "campbell_lazar@asl.org",
    "ian_leary@asl.org",
    "christopher_lhuilier@asl.org",
    "gio_limena@asl.org",
    "sofia_limena@asl.org",
    "joseph_lindner@asl.org",
    "emma_lucas@asl.org",
    "anderson_lugert@asl.org",
    "emilierose_malota@asl.org",
    "nikhil_mehta@asl.org",
    "erika_novak@asl.org",
    "scarlett_novak@asl.org",
    "edward_odwyer@asl.org",
    "clay_olson@asl.org",
    "augi_ora@asl.org",
    "eduardo_pilnik@asl.org",
    "james_potchatek@asl.org",
    "harshiv_puri@asl.org",
    "zain_rafiq@asl.org",
    "harrison_ryan_quy@asl.org",
    "matteo_salloum@asl.org",
    "sofia_salloum@asl.org",
    "lamine_sao@asl.org",
    "ishaan_sareen@asl.org",
    "aadit_sengupta@asl.org",
    "Vica_Sokoloff_Cortes@asl.org",
    "haddy_soliman@asl.org",
    "wes_taylor@asl.org",
    "adi_tsonev@asl.org",
    "yifei_yan@asl.org",
    "muktar_ali@asl.org",
    "lucy_ilyas@asl.org",
    "vica_sokoloff_cortes@asl.org",
    "kingston_bridges@asl.org",
    "shelbe_yousey@asl.org",
  ];

  const allStudents = await prisma.user.findMany();

  for (const student of allStudents) {
    if (!students.includes(student.email)) {
      const delSessions = await prisma.session.deleteMany({
        where: {
          userId: student.id,
        },
      });

      await prisma.tag.deleteMany({
        where: {
          userId: student.id,
        },
      });

      const delStudents = await prisma.user.delete({
        where: {
          id: student.id,
        },
      });

      console.log(student.email);
    }
  }
}

main();
