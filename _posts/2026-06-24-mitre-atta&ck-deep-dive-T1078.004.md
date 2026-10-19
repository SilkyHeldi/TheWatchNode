---
title : "[ATT&CK Deep Dives] : T1078.004 Cloud Accounts"
header:
  overlay_image: /assets/images/DeepDives/CloudAccounts/CloudAccounts.png
  side_image: /assets/images/DeepDives/CloudAccounts/CloudAccounts.png
date : 2026-06-23
toc: true
toc_sticky: true
categories :
    - CTI
tags :
    - DeepDives
    - MITRE ATT&CK
excerpt : "..."
image_preview : /assets/images/DeepDives/CloudAccounts/CloudAccounts.png
---

<!-- Intro : forever techniques, favoris des attaquants,
Cloud more present + online aspect (compared to local/on-prem), easier to reach + easier than other techniques ?
stats ? -->
The Cloud is almost systematically chosen to host companies' information systems, it is even considered as a mandatory step to migrate on-premise data to the a reliable and redundant space. The advantages are that it is easier to manage and very modular for providing different services, but it also means more entry points exist. As Cloud providers propose fast setup and +- control to their customers, the infinite possibilities of misconfigurations and vuln ? make it one of the most favourite targets of the attackers. As a result, we can say that TTP "Cloud accounts" is part of the "Forever techniques".

<!-- DRAFT -->
 adversaries see an opportunity to exploit the interconnectedness of cloud services.
 exfiltrate sensitive data from cloud storage systems
block access to business critical applications
run up the hosting bill by stealing cloud compute for cryptocurrency mining or LLM Hijacking
Cloud accounts, unlike traditional endpoints, may be ephemeral and can be created dynamically with permissions to grant access to numerous applications and systems, posing a significant challenge for defenders. 
Cloud breaches continue to show that initial access techniques can be surprisingly unsophisticated, requiring minimal infrastructure setup and cost for adversaries
 challenging nature of securing and monitoring the complex and dynamic nature of cloud accounts
 They take advantage of this by increasingly targeting where credentials are stored and hijacking that access to achieve their objectives quickly
 ra of single sign-on (SSO), users often experience seamless access without the need for frequent manual sign-ins. This encompasses various factors such as API keys, access tokens, X.509 certificates, biometric data, one-time passwords (OTP), and more, contributing to a multifaceted and secure authentication ecosystem.
 mitigztion : least privilege), thereby limiting the impact if adversaries do steal any credentials.
 Once in possession of legitimate account access, adversaries can closely mimic the normal behavior of genuine users, 
 Newly obtained access is often leveraged through existing web applications, endpoint applications that make use of cloud resources, or even command-line tools. Their focus is mainly to perform reconnaissance through the compromised account to further escalate their permissions and establish permissions in the cloud environment.
 A good example of this reconnaissance stage is sifting through files and emails in a victim’s mailbox in search for passwords or sensitive data -> “smash and grab” style attacks, often decteted like that + uptick in multi-factor authentication (MFA) factor changes
 BUT we mostly detect threats related to Cloud Accounts at login: 
 attempted logins from VPNs, locations, ASNs, devices, browsers, or IP spaces that are unusual for the user
attempted logins to OfficeHome where the user agent is Axios, a JavaScript/NodeJS library that makes HTTP requests from the browser to relay authentication for adversary-in-the-middle attacks
mitigation : 
 enforce MFA for all cloud accounts, implementing phish-resistant MFA methods, such as FIDO2 keys, smart cards, or biometric-based authentication
 DETECTION : Most SaaS applications or cloud providers offer a rich set of logs, but high volume of logs (storage). Placing them into some sort of cold storage for later retrieval is a decent strategy to decrease cost while also maintaining that high value proposition. Main ones :User Account Creation, Metadata, and Modification and Logon Session Creation and Metadata
 precise example of collection for one IaaS ? + Graph Activity Logs importance
 


According to this Red Canary report, "Cloud Accounts" is the top 1 technique used by attackers this year. This is one of the reasons why we are going to talk about this very interesting TTP in this first article of the *[ATT&CK Deep Dives]* series. If you are not familiar with the MITRE ATT&CK framework, I advise you to check out this article : link.TOFIX

1) Matrix context 
Parler des tactiques, pourquoi on les lie à cette TTP
Expliquer les plateformes que ça peut toucher et quelques exemples concrets
IaaS, SaaS
Peu importe comment on y est arrivé
preuve par stats


2) Exemples concrets : à quoi ça ressemble
Reste focus : "Aujourd'hui, on analyse la T1078.004, et on va prendre l'écosystème Microsoft pour imager notre détection."
- impossible travel
- persistence via MFA ou génération app entreprise malveillante (OAuth app)
3) Blueprint : comment on détecte (plus intéressant et technique)
logs audit Cloud
indicateurs : 
- user agent
- localisation
- modifs params sécu compte
- autres spécifiques à cloud ? pourquoi ne pas regrouper avec les autres "Valid Accounts" ?
"L'utilisation d'un compte Cloud légitime est une technique passive (l'attaquant se fond dans la masse). Mais pour détecter ce compte, on va souvent devoir chercher les techniques actives sous-jacentes qu'il va exécuter juste après."
4) The Overlap with Other Techniques
Distinguer la cause et l'effet :
Utiliser un compte Cloud valide (T1078.004) est souvent le moyen d'accès. Mais une fois à l'intérieur, l'action spécifique que l'attaquant va faire pour maintenir cet accès va déclencher d'autres techniques MITRE.
Exemples de recoupements parfaits à citer :

    La modification du MFA / Paramètres de sécurité : Quand l'attaquant modifie les méthodes d'authentification ou crée un nouveau mot de passe, il bascule techniquement dans la TTP T1098 (Account Manipulation). Tu peux l'écrire ainsi : "Once the attacker gains access via a Cloud Account (T1078.004), their next logical step is to maintain access by altering MFA methods—transitioning into Account Manipulation (T1098)."

    La création d'un compte Cloud secondaire : Si l'attaquant utilise son accès admin pour créer un tout nouveau compte "fantôme", il utilise T1136.003 (Create Account: Cloud Account).

    Le vol de sessions (Cookies) : Si l'attaquant a volé un cookie de session pour contourner le MFA et utiliser le compte Cloud, il a d'abord fait du T1539 (Steal Web Session Cookie).

COnclusion : adapt to your company
- GRC: Faire l'inventaire des comptes à privilèges (Admin).
- Hunting : Faire une chasse aux logs une fois par mois sur les connexions depuis des pays non autorisés.
- Réponse (IR) : Quel est le playbook si ça arrive ? (Étape 1 : Révoquer toutes les sessions actives du compte. Étape 2 : Forcer la réinitialisation du mot de passe et du MFA).


https://attack.mitre.org/techniques/T1078/004/
https://redcanary.com/threat-detection-report/techniques/cloud-accounts/
https://redcanary.com/blog/threat-detection/cloud-threat-detection/