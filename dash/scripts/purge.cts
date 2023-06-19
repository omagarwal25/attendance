const { PrismaClient, BuildSession } = require("@prisma/client");
const fs = require("fs");

// any person on the database who isn't on this list should be purged

const data = `om_agarwal@asl.org,07/01/2023,15:15,19:00
om_agarwal@asl.org,08/01/2023,10:10,17:56
ishaan_sareen@asl.org,08/01/2023,10:14,17:56
edward_odwyer@asl.org,08/01/2023,10:14,18:00
yifei_yan@asl.org,08/01/2023,10:14,17:46
ian_beal@asl.org,08/01/2023,10:14,17:46
eduardo_pilnik@asl.org,08/01/2023,10:14,17:47
christopher_lhuilier@asl.org,08/01/2023,10:14,17:47
clay_olson@asl.org,08/01/2023,10:14,17:49
leisha_bhatnagar@asl.org,08/01/2023,10:14,17:46
sofia_limena@asl.org,08/01/2023,10:14,18:00
matteo_salloum@asl.org,08/01/2023,10:15,17:57
oskar_doepke@asl.org,08/01/2023,10:15,18:00
siena_chae@asl.org,08/01/2023,10:15,17:51
gio_limena@asl.org,08/01/2023,10:15,17:46
scarlett_novak@asl.org,08/01/2023,10:15,17:48
lucy_ilyas@asl.org,08/01/2023,10:15,17:14
jack_albrecht@asl.org,08/01/2023,10:15,17:46
harrison_ryan_quy@asl.org,08/01/2023,10:15,17:30
emilierose_malota@asl.org,08/01/2023,10:15,17:51
xavier_goff@asl.org,08/01/2023,10:15,17:52
vica_sokoloff_cortes@asl.org,08/01/2023,10:15,17:51
lamine_sao@asl.org,08/01/2023,10:16,17:46
wes_taylor@asl.org,08/01/2023,10:16,14:00
shelbe_yousey@asl.org,08/01/2023,10:16,17:48
trevon_ashton@asl.org,08/01/2023,10:16,17:46
matthew_furst@asl.org,08/01/2023,10:16,18:00
alexis_gerwe@asl.org,08/01/2023,10:16,17:30
daniel_gooch@asl.org,08/01/2023,10:16,15:00
zain_rafiq@asl.org,08/01/2023,10:16,17:48
anderson_lugert@asl.org,08/01/2023,10:17,15:00
perry_chen@asl.org,08/01/2023,10:17,17:49
suchir_jindal@asl.org,08/01/2023,10:17,17:46
noah_fernihough@asl.org,08/01/2023,12:48,17:47
haddy_soliman@asl.org,08/01/2023,12:59,17:46
harshiv_puri@asl.org,08/01/2023,17:46,18:00
gio_limena@asl.org,08/01/2023,17:46,17:47
alexis_gerwe@asl.org,09/01/2023,15:10,19:21
eduardo_pilnik@asl.org,09/01/2023,15:10,18:32
noah_fernihough@asl.org,09/01/2023,15:10,19:00
ian_leary@asl.org,09/01/2023,15:10,19:00
harshiv_puri@asl.org,09/01/2023,15:10,19:00
yuval_fransis@asl.org,09/01/2023,15:10,19:00
konstantinos_dalglish@asl.org,09/01/2023,15:10,18:58
trevon_ashton@asl.org,09/01/2023,15:10,19:00
jack_albrecht@asl.org,09/01/2023,15:10,19:00
scarlett_novak@asl.org,09/01/2023,15:10,19:00
matthew_furst@asl.org,09/01/2023,15:10,19:21
vica_sokoloff_cortes@asl.org,09/01/2023,15:10,19:02
gabi_dawson@asl.org,09/01/2023,15:11,19:00
sofia_limena@asl.org,09/01/2023,15:11,19:18
aadit_sengupta@asl.org,09/01/2023,15:11,19:00
perry_chen@asl.org,09/01/2023,15:11,19:21
ishaan_sareen@asl.org,09/01/2023,15:11,19:00
yifei_yan@asl.org,09/01/2023,15:12,19:01
matteo_salloum@asl.org,09/01/2023,15:12,19:00
anderson_lugert@asl.org,09/01/2023,15:12,19:00
edward_odwyer@asl.org,09/01/2023,15:12,19:21
harrison_ryan_quy@asl.org,09/01/2023,15:13,19:00
clay_olson@asl.org,09/01/2023,15:13,19:00
lamine_sao@asl.org,09/01/2023,15:13,19:22
gio_limena@asl.org,09/01/2023,15:14,18:59
siena_chae@asl.org,09/01/2023,15:14,19:21
leisha_bhatnagar@asl.org,09/01/2023,15:14,19:00
magnus_carson@asl.org,09/01/2023,15:14,19:00
rowan_hamilton@asl.org,09/01/2023,15:15,18:58
shelbe_yousey@asl.org,09/01/2023,15:15,16:03
bia_caseiras@asl.org,09/01/2023,15:15,19:00
christopher_lhuilier@asl.org,09/01/2023,15:16,19:24
lucy_ilyas@asl.org,09/01/2023,15:14,18:58
blu_belinky@asl.org,09/01/2023,15:40,19:00
oskar_doepke@asl.org,09/01/2023,15:16,18:28
om_agarwal@asl.org,09/01/2023,16:03,19:02
tommy_turner@asl.org,09/01/2023,15:20,19:00
om_agarwal@asl.org,10/01/2023,15:09,19:25
vica_sokoloff_cortes@asl.org,10/01/2023,15:09,19:01
harshiv_puri@asl.org,10/01/2023,15:09,19:02
konstantinos_dalglish@asl.org,10/01/2023,15:09,19:03
anderson_lugert@asl.org,10/01/2023,15:09,19:01
ian_beal@asl.org,10/01/2023,15:09,19:03
perry_chen@asl.org,10/01/2023,15:09,19:06
lucy_ilyas@asl.org,10/01/2023,15:09,19:02
daniel_gooch@asl.org,10/01/2023,15:10,19:01
tommy_turner@asl.org,10/01/2023,15:10,19:02
aadit_sengupta@asl.org,10/01/2023,15:10,19:00
magnus_carson@asl.org,10/01/2023,15:10,19:24
rowan_hamilton@asl.org,10/01/2023,15:10,19:02
christopher_lhuilier@asl.org,10/01/2023,15:10,19:22
robi_arpaio@asl.org,10/01/2023,15:10,19:02
leisha_bhatnagar@asl.org,10/01/2023,15:10,19:02
yuval_fransis@asl.org,10/01/2023,15:11,17:06
scarlett_novak@asl.org,10/01/2023,15:11,19:02
ishaan_sareen@asl.org,10/01/2023,15:11,19:05
edward_odwyer@asl.org,10/01/2023,15:11,19:24
alexis_gerwe@asl.org,10/01/2023,15:11,19:20
jack_albrecht@asl.org,10/01/2023,15:11,19:00
clay_olson@asl.org,10/01/2023,15:11,19:01
yifei_yan@asl.org,10/01/2023,15:12,19:05
noah_fernihough@asl.org,10/01/2023,15:12,19:01
ian_leary@asl.org,10/01/2023,15:12,19:01
matthew_furst@asl.org,10/01/2023,15:13,19:23
sofia_salloum@asl.org,10/01/2023,15:13,19:02
gabi_dawson@asl.org,10/01/2023,15:13,15:39
zain_rafiq@asl.org,10/01/2023,15:13,19:02
oskar_doepke@asl.org,10/01/2023,15:15,19:00
erika_novak@asl.org,10/01/2023,15:15,19:00
trevon_ashton@asl.org,10/01/2023,15:16,19:02
bia_caseiras@asl.org,10/01/2023,15:16,18:20
matteo_salloum@asl.org,10/01/2023,15:18,19:24
campbell_lazar@asl.org,10/01/2023,15:19,17:27
suchir_jindal@asl.org,10/01/2023,15:21,19:03
gio_limena@asl.org,10/01/2023,15:25,15:58
gio_limena@asl.org,10/01/2023,15:58,19:02
lamine_sao@asl.org,10/01/2023,16:32,19:24
blu_belinky@asl.org,10/01/2023,17:00,19:00
campbell_lazar@asl.org,10/01/2023,17:27,17:27
blu_belinky@asl.org,13/01/2023,15:10,19:00
joseph_lindner@asl.org,08/01/2023,10:00,18:00
ian_beal@asl.org,13/01/2023,15:10,19:03
joseph_lindner@asl.org,13/01/2023,15:10,19:06
matthew_furst@asl.org,13/01/2023,15:10,19:10
ian_leary@asl.org,13/01/2023,15:11,19:05
harshiv_puri@asl.org,13/01/2023,15:11,19:01
rowan_hamilton@asl.org,13/01/2023,15:11,19:05
aadit_sengupta@asl.org,13/01/2023,15:11,19:05
om_agarwal@asl.org,13/01/2023,15:11,19:07
noah_fernihough@asl.org,13/01/2023,15:11,19:05
gabi_dawson@asl.org,13/01/2023,15:11,19:06
christopher_lhuilier@asl.org,13/01/2023,15:11,19:00
vica_sokoloff_cortes@asl.org,13/01/2023,15:11,19:07
scarlett_novak@asl.org,13/01/2023,15:11,19:05
harrison_ryan_quy@asl.org,13/01/2023,15:11,19:05
yifei_yan@asl.org,13/01/2023,15:11,19:04
jack_albrecht@asl.org,13/01/2023,15:11,19:05
leisha_bhatnagar@asl.org,13/01/2023,15:11,15:56
yuval_fransis@asl.org,13/01/2023,15:11,18:09
emilierose_malota@asl.org,13/01/2023,15:11,19:05
konstantinos_dalglish@asl.org,13/01/2023,15:11,19:03
siena_chae@asl.org,13/01/2023,15:11,19:06
erika_novak@asl.org,13/01/2023,15:12,18:59
perry_chen@asl.org,13/01/2023,15:12,19:08
sofia_limena@asl.org,13/01/2023,15:12,19:06
wes_taylor@asl.org,13/01/2023,15:12,19:06
matteo_salloum@asl.org,13/01/2023,15:12,19:06
trevon_ashton@asl.org,13/01/2023,15:12,19:07
ishaan_sareen@asl.org,13/01/2023,15:13,19:10
edward_odwyer@asl.org,13/01/2023,15:13,19:00
sofia_salloum@asl.org,13/01/2023,15:13,19:05
lamine_sao@asl.org,13/01/2023,15:14,19:11
oskar_doepke@asl.org,13/01/2023,15:14,19:06
lucy_ilyas@asl.org,13/01/2023,15:14,18:58
ryan_ganguli@asl.org,13/01/2023,15:15,18:30
tommy_turner@asl.org,13/01/2023,15:18,19:06
suchir_jindal@asl.org,13/01/2023,15:20,19:08
gio_limena@asl.org,13/01/2023,15:21,19:06
xavier_goff@asl.org,13/01/2023,15:21,19:00
alexis_gerwe@asl.org,13/01/2023,15:22,19:07
adi_tsonev@asl.org,13/01/2023,15:22,18:00
magnus_carson@asl.org,13/01/2023,15:27,19:05
eduardo_pilnik@asl.org,13/01/2023,15:59,17:52
clay_olson@asl.org,13/01/2023,16:02,18:57
ishaan_sareen@asl.org,14/01/2023,07:58,17:15
edward_odwyer@asl.org,14/01/2023,08:02,17:55
noah_fernihough@asl.org,14/01/2023,08:55,17:18
konstantinos_dalglish@asl.org,14/01/2023,08:59,17:18
harrison_ryan_quy@asl.org,14/01/2023,08:59,16:03
jack_albrecht@asl.org,14/01/2023,09:00,17:07
ryan_ganguli@asl.org,14/01/2023,09:01,15:28
clay_olson@asl.org,14/01/2023,09:02,17:19
christopher_lhuilier@asl.org,14/01/2023,09:02,17:54
scarlett_novak@asl.org,14/01/2023,09:02,17:01
matthew_furst@asl.org,14/01/2023,09:03,17:54
perry_chen@asl.org,14/01/2023,09:04,17:55
om_agarwal@asl.org,14/01/2023,09:08,17:55
siena_chae@asl.org,14/01/2023,09:08,17:54
yifei_yan@asl.org,14/01/2023,09:08,17:18
alexis_gerwe@asl.org,14/01/2023,09:11,11:24
gio_limena@asl.org,14/01/2023,09:11,17:18
ian_beal@asl.org,14/01/2023,09:13,17:27
sofia_salloum@asl.org,14/01/2023,09:24,17:01
vica_sokoloff_cortes@asl.org,14/01/2023,09:27,17:23
sofia_salloum@asl.org,07/01/2023,16:00,19:00
sofia_salloum@asl.org,08/01/2023,10:00,18:00
sofia_salloum@asl.org,09/01/2023,15:15,19:00
joseph_lindner@asl.org,14/01/2023,09:33,17:18
gabi_dawson@asl.org,14/01/2023,09:30,14:30
ian_leary@asl.org,14/01/2023,09:37,17:18
sofia_limena@asl.org,14/01/2023,09:30,14:30
blu_belinky@asl.org,14/01/2023,09:40,16:30
matteo_salloum@asl.org,14/01/2023,09:39,17:55
anderson_lugert@asl.org,14/01/2023,09:41,14:22
tommy_turner@asl.org,14/01/2023,09:43,17:15
emilierose_malota@asl.org,14/01/2023,09:43,17:18
wes_taylor@asl.org,14/01/2023,09:43,17:15
oskar_doepke@asl.org,14/01/2023,09:49,17:18
lucy_ilyas@asl.org,14/01/2023,10:02,17:01
zain_rafiq@asl.org,14/01/2023,10:27,17:15
suchir_jindal@asl.org,14/01/2023,10:30,17:18
trevon_ashton@asl.org,14/01/2023,10:47,17:23
harshiv_puri@asl.org,14/01/2023,11:32,17:05
daniel_gooch@asl.org,14/01/2023,11:32,14:22
adi_tsonev@asl.org,14/01/2023,12:15,16:56
magnus_carson@asl.org,14/01/2023,11:36,17:55
lamine_sao@asl.org,14/01/2023,13:04,17:54
eduardo_pilnik@asl.org,14/01/2023,13:40,17:00
yuval_fransis@asl.org,14/01/2023,13:59,17:01
om_agarwal@asl.org,16/01/2023,15:09,15:45
konstantinos_dalglish@asl.org,16/01/2023,15:09,18:59
suchir_jindal@asl.org,16/01/2023,15:09,19:01
ian_beal@asl.org,16/01/2023,15:09,19:00
aadit_sengupta@asl.org,16/01/2023,15:09,19:04
harshiv_puri@asl.org,16/01/2023,15:09,18:56
tommy_turner@asl.org,16/01/2023,15:09,19:01
magnus_carson@asl.org,16/01/2023,15:10,19:07
ryan_ganguli@asl.org,16/01/2023,15:11,18:02
edward_odwyer@asl.org,16/01/2023,15:11,19:08
matthew_furst@asl.org,16/01/2023,15:11,19:07
noah_fernihough@asl.org,16/01/2023,15:11,19:03
lucy_ilyas@asl.org,16/01/2023,15:11,18:58
christopher_lhuilier@asl.org,16/01/2023,15:12,19:07
siena_chae@asl.org,16/01/2023,15:12,18:17
sofia_limena@asl.org,16/01/2023,15:12,19:00
sofia_salloum@asl.org,16/01/2023,15:12,18:58
yuval_fransis@asl.org,16/01/2023,15:12,17:22
rowan_hamilton@asl.org,16/01/2023,15:12,18:58
vica_sokoloff_cortes@asl.org,16/01/2023,15:15,19:00
harrison_ryan_quy@asl.org,16/01/2023,15:13,18:56
scarlett_novak@asl.org,16/01/2023,15:13,18:58
joseph_lindner@asl.org,16/01/2023,15:13,18:56
perry_chen@asl.org,16/01/2023,15:13,18:56
clay_olson@asl.org,16/01/2023,15:15,18:59
trevon_ashton@asl.org,16/01/2023,15:15,18:57
lamine_sao@asl.org,16/01/2023,15:15,18:25
xavier_goff@asl.org,16/01/2023,15:15,18:56
emilierose_malota@asl.org,16/01/2023,15:15,19:15
matteo_salloum@asl.org,16/01/2023,15:17,19:15
ian_leary@asl.org,16/01/2023,15:17,19:04
shelbe_yousey@asl.org,16/01/2023,15:19,17:06
gabi_dawson@asl.org,16/01/2023,15:20,18:41
robi_arpaio@asl.org,16/01/2023,15:20,15:44
bia_caseiras@asl.org,16/01/2023,15:21,18:36
anderson_lugert@asl.org,16/01/2023,15:22,17:58
ishaan_sareen@asl.org,16/01/2023,15:22,19:06
gio_limena@asl.org,16/01/2023,15:41,19:00
wes_taylor@asl.org,16/01/2023,15:43,17:31
eduardo_pilnik@asl.org,16/01/2023,15:43,18:56
blu_belinky@asl.org,16/01/2023,15:45,19:00
oskar_doepke@asl.org,16/01/2023,15:30,18:20
alexis_gerwe@asl.org,16/01/2023,16:01,19:07
yifei_yan@asl.org,16/01/2023,15:15,17:52
adi_tsonev@asl.org,16/01/2023,15:15,18:00
augi_ora@asl.org,16/01/2023,15:15,18:00
xavier_goff@asl.org,14/01/2023,10:00,17:15
jack_albrecht@asl.org,16/01/2023,15:15,19:00
yifei_yan@asl.org,17/01/2023,15:11,19:07
perry_chen@asl.org,17/01/2023,15:11,19:57
daniel_gooch@asl.org,17/01/2023,15:11,18:13
vica_sokoloff_cortes@asl.org,17/01/2023,15:11,19:05
yuval_fransis@asl.org,17/01/2023,15:11,19:05
harshiv_puri@asl.org,17/01/2023,15:11,19:03
suchir_jindal@asl.org,17/01/2023,15:11,19:14
tommy_turner@asl.org,17/01/2023,15:11,17:52
zain_rafiq@asl.org,17/01/2023,15:11,19:07
siena_chae@asl.org,17/01/2023,15:11,19:57
harrison_ryan_quy@asl.org,17/01/2023,15:12,19:07
konstantinos_dalglish@asl.org,17/01/2023,15:12,19:07
noah_fernihough@asl.org,17/01/2023,15:12,16:29
scarlett_novak@asl.org,17/01/2023,15:12,19:12
anderson_lugert@asl.org,17/01/2023,15:12,18:13
ryan_ganguli@asl.org,17/01/2023,15:12,18:04
emilierose_malota@asl.org,17/01/2023,15:12,19:06
matthew_furst@asl.org,17/01/2023,15:13,19:57
clay_olson@asl.org,17/01/2023,15:13,19:11
lamine_sao@asl.org,17/01/2023,15:13,19:57
edward_odwyer@asl.org,17/01/2023,15:13,19:00
ishaan_sareen@asl.org,17/01/2023,15:13,19:57
bia_caseiras@asl.org,17/01/2023,15:15,19:00
xavier_goff@asl.org,17/01/2023,15:13,19:00
lucy_ilyas@asl.org,17/01/2023,15:14,19:07
blu_belinky@asl.org,17/01/2023,15:15,19:00
haddy_soliman@asl.org,17/01/2023,15:15,19:07
adi_tsonev@asl.org,17/01/2023,15:22,16:29
augi_ora@asl.org,17/01/2023,15:22,16:10
alexis_gerwe@asl.org,17/01/2023,15:30,19:57
magnus_carson@asl.org,17/01/2023,15:30,19:57
matteo_salloum@asl.org,17/01/2023,15:32,19:57
joseph_lindner@asl.org,17/01/2023,15:34,19:07
sofia_salloum@asl.org,17/01/2023,15:46,19:12
oskar_doepke@asl.org,17/01/2023,15:51,19:08
trevon_ashton@asl.org,17/01/2023,15:55,19:12
ian_beal@asl.org,17/01/2023,16:15,19:07
christopher_lhuilier@asl.org,17/01/2023,16:32,19:56
erika_novak@asl.org,17/01/2023,17:24,17:24
erika_novak@asl.org,17/01/2023,17:24,19:03
rowan_hamilton@asl.org,17/01/2023,19:05,19:06
wes_taylor@asl.org,17/01/2023,19:10,19:10
trevon_ashton@asl.org,17/01/2023,19:12,19:12
jack_albrecht@asl.org,17/01/2023,15:10,19:00
christopher_lhuilier@asl.org,20/01/2023,15:11,19:16
suchir_jindal@asl.org,20/01/2023,15:11,19:00
eduardo_pilnik@asl.org,20/01/2023,15:11,18:55
anderson_lugert@asl.org,20/01/2023,15:11,16:21
joseph_lindner@asl.org,20/01/2023,15:11,19:00
aadit_sengupta@asl.org,20/01/2023,15:11,19:00
perry_chen@asl.org,20/01/2023,15:11,19:15
tommy_turner@asl.org,20/01/2023,15:11,19:00
ian_leary@asl.org,20/01/2023,15:11,19:00
noah_fernihough@asl.org,20/01/2023,15:12,19:00
magnus_carson@asl.org,20/01/2023,15:12,19:16
yifei_yan@asl.org,20/01/2023,15:12,19:17
yuval_fransis@asl.org,20/01/2023,15:12,18:11
sofia_salloum@asl.org,20/01/2023,15:12,19:00
scarlett_novak@asl.org,20/01/2023,15:12,19:00
leisha_bhatnagar@asl.org,20/01/2023,15:12,19:00
konstantinos_dalglish@asl.org,20/01/2023,15:12,19:00
rowan_hamilton@asl.org,20/01/2023,15:12,17:39
lucy_ilyas@asl.org,20/01/2023,15:12,19:00
harrison_ryan_quy@asl.org,20/01/2023,15:12,19:02
siena_chae@asl.org,20/01/2023,15:12,19:16
matthew_furst@asl.org,20/01/2023,15:12,19:16
om_agarwal@asl.org,20/01/2023,15:12,19:16
xavier_goff@asl.org,20/01/2023,15:12,19:00
wes_taylor@asl.org,20/01/2023,15:13,19:05
emilierose_malota@asl.org,20/01/2023,15:13,19:05
ryan_ganguli@asl.org,20/01/2023,15:13,16:31
adi_tsonev@asl.org,20/01/2023,15:13,19:00
clay_olson@asl.org,20/01/2023,15:13,19:00
erika_novak@asl.org,20/01/2023,15:13,19:02
gio_limena@asl.org,20/01/2023,15:14,19:00
edward_odwyer@asl.org,20/01/2023,15:14,19:16
alexis_gerwe@asl.org,20/01/2023,15:14,19:15
lamine_sao@asl.org,20/01/2023,15:16,19:18
sofia_limena@asl.org,20/01/2023,15:16,19:16
gabi_dawson@asl.org,20/01/2023,15:16,19:03
augi_ora@asl.org,20/01/2023,15:18,18:59
blu_belinky@asl.org,20/01/2023,15:15,19:00
jack_albrecht@asl.org,20/01/2023,15:21,19:00
matteo_salloum@asl.org,20/01/2023,15:30,19:16
bia_caseiras@asl.org,07/01/2023,16:00,19:00
bia_caseiras@asl.org,08/01/2023,10:00,18:00
bia_caseiras@asl.org,20/01/2023,15:52,19:00
haddy_soliman@asl.org,20/01/2023,16:28,18:59
yuval_fransis@asl.org,20/01/2023,18:11,18:11
bia_caseiras@asl.org,20/01/2023,19:00,19:00
edward_odwyer@asl.org,21/01/2023,08:54,18:00
emilierose_malota@asl.org,21/01/2023,08:55,17:04
scarlett_novak@asl.org,21/01/2023,08:57,17:04
shelbe_yousey@asl.org,21/01/2023,08:59,17:04
harrison_ryan_quy@asl.org,21/01/2023,09:00,17:04
ian_leary@asl.org,21/01/2023,09:02,17:04
lucy_ilyas@asl.org,21/01/2023,09:03,15:04
konstantinos_dalglish@asl.org,21/01/2023,09:05,17:04
clay_olson@asl.org,21/01/2023,09:05,17:04
sofia_salloum@asl.org,21/01/2023,09:06,17:05
lamine_sao@asl.org,21/01/2023,09:07,18:00
wes_taylor@asl.org,21/01/2023,09:07,17:04
matthew_furst@asl.org,21/01/2023,09:08,18:00
sofia_limena@asl.org,21/01/2023,09:10,18:00
yifei_yan@asl.org,21/01/2023,09:10,17:04
ian_beal@asl.org,21/01/2023,09:10,17:04
matteo_salloum@asl.org,21/01/2023,09:11,18:00
christopher_lhuilier@asl.org,21/01/2023,09:13,18:00
ishaan_sareen@asl.org,21/01/2023,09:20,18:00
xavier_goff@asl.org,21/01/2023,09:21,17:00
robi_arpaio@asl.org,21/01/2023,09:21,17:04
om_agarwal@asl.org,21/01/2023,09:21,18:00
bia_caseiras@asl.org,21/01/2023,09:25,16:07
rowan_hamilton@asl.org,21/01/2023,09:25,17:04
jack_albrecht@asl.org,21/01/2023,09:26,17:06
blu_belinky@asl.org,21/01/2023,09:10,17:00
magnus_carson@asl.org,21/01/2023,09:39,18:00
siena_chae@asl.org,21/01/2023,09:39,17:13
gio_limena@asl.org,21/01/2023,09:41,17:04
tommy_turner@asl.org,21/01/2023,09:44,16:45
ryan_ganguli@asl.org,21/01/2023,09:46,17:04
leisha_bhatnagar@asl.org,21/01/2023,09:50,17:04
perry_chen@asl.org,21/01/2023,10:10,18:00
noah_fernihough@asl.org,21/01/2023,10:13,17:06
alexis_gerwe@asl.org,21/01/2023,10:22,18:00
augi_ora@asl.org,21/01/2023,10:39,17:04
haddy_soliman@asl.org,21/01/2023,11:36,14:52
adi_tsonev@asl.org,21/01/2023,12:22,17:04
eduardo_pilnik@asl.org,21/01/2023,13:41,17:04
suchir_jindal@asl.org,21/01/2023,11:30,17:00`;

const prisma = new PrismaClient();

// const calculateHoursFromListOfSessions = (sessions) => {
//   const hours = sessions.reduce((acc, session) => {
//     if (!session.endAt) return acc;

//     const diff = session.endAt.getTime() - session.startAt.getTime();
//     const hours = diff / 1000 / 60 / 60;
//     return acc + hours;
//   }, 0);
//   return hours;
// };

async function main() {
  for (const line of data.split("\n")) {
    const [email, date, int, out] = line.split(",");

    const [day, month, year] = date.split("/");

    if (day !== "07" && day !== "08") continue;

    // 24 hour time, british date format
    const inDate = new Date(`${year}-${month}-${day}T${int}:00.000Z`);
    const outDate = new Date(`${year}-${month}-${day}T${out}:00.000Z`);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    await prisma.buildSession.create({
      data: {
        startAt: inDate,
        endAt: outDate,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    console.log(email, inDate, outDate);
  }
  // create a file to write to

  // const sessions = await prisma.buildSession.findMany({
  //   include: {
  //     user: true,
  //   },
  // });

  // for (const session of sessions) {
  //   // if the year is 2022 delete the session
  //   if ([7, 8].includes(new Date(session.startAt).getUTCDate())) {
  //     console.log(session.user.email, session.startAt, session.endAt);
  //     await prisma.buildSession.delete({
  //       where: {
  //         id: session.id,
  //       },
  //     });
  //   }
  // }

  // const users = await prisma.user.findMany({
  //   include: {
  //     buildSessions: true,
  //   },
  // });

  // for (const user of users) {
  //   const hours = calculateHoursFromListOfSessions(user.buildSessions);
  //   // console.log(user.email, hours);

  //   if (hours === 0 && user.email !== "muktar_ali@asl.org") {
  //     console.log("deleting user", user.email);

  //     await prisma.buildSession.deleteMany({
  //       where: {
  //         userId: user.id,
  //       },
  //     });

  //     await prisma.tag.deleteMany({
  //       where: {
  //         userId: user.id,
  //       },
  //     });

  //     await prisma.session.deleteMany({
  //       where: {
  //         userId: user.id,
  //       },
  //     });

  //     await prisma.user.delete({
  //       where: {
  //         id: user.id,
  //       },
  //     });
  //   }
  // }
}

main();
