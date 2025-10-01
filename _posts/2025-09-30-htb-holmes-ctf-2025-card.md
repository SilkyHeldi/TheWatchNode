---
title : "HTB Holmes CTF 2025 - The Card (easy)"
header:
  overlay_image: /assets/images/lol.png
  side_image: /assets/images/HTB-Holmes-CTF-2025/holmes-banner.png
date : 2025-09-30
toc: true
toc_sticky: true
categories :
    - CTF
tags :
    - Holmes-CTF-2025
    - Write-up
    - HTB
    - Threat-intelligence
excerpt : "An easy challenge from the Holmes CTF that makes us use simplified Threat-intelligence-like platforms to learn more about the threat actor that performed multiple attacks against the Cogwork-1 organization."
image_preview : /assets/images/HTB-Holmes-CTF-2025/holmes-banner.png
---


## The Card

> Holmes receives a breadcrumb from Dr. Nicole Vale - fragments from a string of cyber incidents across Cogwork-1. Each lead ends the same way: a digital calling card signed JM.

We are given 3 files and we can spawn 3 docker containers.

```bash
$ tree The_Card 
The_Card
├── access.log
├── application.log
└── waf.log

1 directory, 3 files
```

The first thing we do is to get a brief overview of every single element that we have.
Here, the file names are pretty explicit but it is still a good thing to check what is logged exactly and how.

- the access.log file shows the first information we can get about web requests, that's to say
    - the timestamp
    - the client IP address
    - the HTTP method
    - the requested path
    - the HTTP protocol version
    - the HTTP status code
    - the size of the response
    - the User-Agent string (that identifies the client software)

Here is an example of an entry :
```
2025-05-01 08:23:12 121.36.37.224 - - [01/May/2025:08:23:12 +0000] "GET /robots.txt HTTP/1.1" 200 847 "-" "Lilnunc/4A4D - SpecterEye"
```

- the application.log file shows detections of suspicious actions performed on the website

Example :
![application.log file view](../../assets/images/HTB-Holmes-CTF-2025/The-card/application-log-view.png)

- the waf.log file shows the actions on the network that triggered certain rules and their resultant actions

Example : 
![waf.log file view](../../assets/images/HTB-Holmes-CTF-2025/The-card/waf-log-view.png)


- the docker containers give access to very simplified Threat Intelligence platforms

**Info notice :**
This CTF is question-oriented. Note that the answers were not necessarily found in the same order as the questions.
{: .notice--info}

## The first user-agent used by the attacker

> Analyze the provided logs and identify what is the first User-Agent used by the attacker against Nicole Vale's honeypot. (string)

Nicole Vale is an investigator and seems to have caught the enemy in action.

The user-agent is pretty obvious in the access logs in the User-agent string at the end of each entry :
"Lilnunc/4A4D - SpecterEye"

## The deployed web shell

> It appears the threat actor deployed a web shell after bypassing the WAF. What is the file name? (filename.ext)

There, we hope for a kind of web shell detection, so I use ctrl-F in ```waf.log``` and find a very useful "WEBSHELL_DEPLOYMENT" rule :

![waf.log : WEBSHELL_DEPLOYMENT rule](../../assets/images/HTB-Holmes-CTF-2025/The-card/waf-webshell-deployment-rule.png)

Notice the multiple unknown errors (from ```2025-05-15 11:23:45```) above provoked by command injections that allowed that deployment.

![waf.log : WEBSHELL_DEPLOYMENT rule](../../assets/images/HTB-Holmes-CTF-2025/The-card/cmd-injection.png)

The webshell that is deployed is ```temp_4A4D.php```

## The exfiltrated database

> The threat actor also managed to exfiltrate some data. What is the name of the database that was exfiltrated? (filename.ext)

We were hoping to find another "exfiltration" rule and luckily found it on the first try. We could also find the file by searching for a database extension like ```.sql```.
Reallistically, it would be better to search for a file compression with the different tools that exist as a keyword (```zip```, ```7z```, ```tar```, etc...). It is indeed used there for data staging :

![application.log : data staging detection](../../assets/images/HTB-Holmes-CTF-2025/The-card/app-db-exfil.png)

The exfiltrated database is ```database_dump_4A4D.sql```

## Recurring string for threat actor attribution

> During the attack, a seemingly meaningless string seems to be recurring. Which one is it? (string)

Here, the string is very obvious. Threat actors tend to leave recurrent traces behind that allow investigators to attribute a malicious activity to a specific entity (a person, an organization, an entire nation...).
For example, in a [Mandiant][mandiant] report, a specific pattern had been found in email nicknames, that led to identify the person behind them.
In another report, specific ways of creating functions in a malware helped investigators to recognize the [APT (Advanced Persistent Threat)][APT] behind it.

Threat actors' habits and/or ego can betray their "footprints". Here, the reccurent string is ```4A4D``` which is the hexadecimal value for ```JM```.
Since we are helping Sherlock Holmes, we suppose JM could be the initials of James Moriarty.

## Identifying the campaigns linked to the attack

> OmniYard-3 (formerly Scotland Yard) has granted you access to its CTI platform. Browse to the first IP:port address and count how many campaigns appear to be linked to the honeypot attack.

Once on the CTI platform, we put ```4A4D``` in the filter section, since it is a reccuring artifact. We find an organization named ```JM```. It is linked to 5 campaigns on the platform, in bright red rounds.  

![CTI platform : "4A4D" filter](../../assets/images/HTB-Holmes-CTF-2025/The-card/CTI-4A4D-campaigns.png)

## Size of the campaigns' arsenal

> How many tools and malware in total are linked to the previously identified campaigns? (number)

Zooming out with no filter gives us an entire overview of the artifacts that are linked to the JM organization. The red rounds with a virus icon are the malwares and the orange rounds with the wrench icon are the tools.

![CTI platform : "4A4D" filter](../../assets/images/HTB-Holmes-CTF-2025/The-card/CTI-arsenal2.png)

We count 9 of them in total.

## The SHA256 hash of the unique malware

> It appears that the threat actor has always used the same malware in their campaigns. What is its SHA-256 hash? (sha-256 hash)

We can see that all of the campaigns used different names and show drastically different capabilities for the same malware (quite weird).
<br>For example, we can see a private key stealer but also a biometric falsifier.

![CTI platform : malware ex1](../../assets/images/HTB-Holmes-CTF-2025/The-card/CTI-stealer.png)

![CTI platform : malware ex2](../../assets/images/HTB-Holmes-CTF-2025/The-card/CTI-falsifier.png)

We know it's the same since the sha-256 hash is the same everytime : ```SHA256 = '7477c4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d17477'```

![CTI platform : hash](../../assets/images/HTB-Holmes-CTF-2025/The-card/CTI-hash2.png)

## File hash inspection

> Browse to the second IP:port address and use the CogWork Security Platform to look for the hash and locate the IP address to which the malware connects. (Credentials: nvale/CogworkBurning!)

Once we get a file hash in general, we want to inspect it to see if it has other linked information that has been reported. This platform makes me think about VirusTotal.
<br>We easily find the linked IP and port, that seem to be where their Command and Control operates from : 74[.]77.74.77:443 

![CTI hash inspection : C2 IP](../../assets/images/HTB-Holmes-CTF-2025/The-card/hash-C2-IP.png)

## Persistence of malware

> What is the full path of the file that the malware created to ensure its persistence on systems? (/path/filename.ext)

Here, the name of the files created by the malware is very explicit : ```/opt/lilnunc/implant/4a4d_persistence.sh```

![CTI hash inspection : persistence](../../assets/images/HTB-Holmes-CTF-2025/The-card/hash-persistence2.png)

## IP address inspection

> Finally, browse to the third IP:port address and use the CogNet Scanner Platform to discover additional details about the TA's infrastructure. How many open ports does the server have?

We are provided with another platform which makes me think about Shodan, a platform that shows exposed ports of an IP address. It is important for investigators to know that information since if the attacker's infrastructure can be accessed by other stakeholders, the potential exposition of the enterprise's assets is even more critical.
<br>This address has  11 open ports.

![CTI IP inspection : exposed ports](../../assets/images/HTB-Holmes-CTF-2025/The-card/exposed-ports.png)

## IP address owner

> Which organization does the previously identified IP belong to? (string)

This IP belongs to ```SenseShield MSP```

"A managed services provider (MSP) is an outsourced third-party company that takes on the ongoing, day-to-day responsibilities, monitoring, and maintenance of a range of tasks and functions for another company—their customer."
[Source][MSP]

We can suppose that this MSP, providing its services to the company, has been compromised.

![CTI IP inspection : organization](../../assets/images/HTB-Holmes-CTF-2025/The-card/IP-organization2.png)

## Inspecting the exposed services

> One of the exposed services displays a banner containing a cryptic message. What is it? (string)

In the service section, we can notice an unusual string : ```"He's a ghost I carry, not to haunt me, but to hold me together - NULLINC REVENGE"```

![CTI IP inspection : organization](../../assets/images/HTB-Holmes-CTF-2025/The-card/IP-cryptic.png)


## Conclusion

- **DEFENCE - Preparation** : Nicole Vale, Senior security analyst, set up a honey pot in the Cogwork-1 network.

- **Exploitation** : The threat actor found a way to inject commands in the ```/api/v2/debug/exec``` path, which might have been deliberately left there by N. Vale.

- **Installation + Persistence** : The attacker deployed a php web shell that apparently installed a backdoor thanks to SSH key generation and a cron job installation.

- **Exfiltration** : They exfiltrated an SQL database after compressing it.

- **DEFENCE - Threat Intelligence** : They left a recurrent string inside the file names they chose, ```4A4D``` (hexadecimal for ```JM```), that allowed us to identify the campaigns, tools, malwares, IP addresses, C2 file path and other [IOCs][ioc] thanks to our provided Threat Intelligence platforms.
<br>The IP address that was used by the attacker belongs to ```SenseShield MSP``` and has 11 open ports. This might indicate that an MSP could have been compromised.
<br>
This honeypot allowed us to know more about the Threat Actor, ```JM```, that is actively targetting Cogwork.

**GG**

[MSP]: https://www.sap.com/products/hcm/workforce-management/what-is-a-msp.html
[APT]: https://www.crowdstrike.com/en-us/cybersecurity-101/threat-intelligence/advanced-persistent-threat-apt/
[mandiant]: https://www.mandiant.com/
[ioc]: https://www.crowdstrike.com/en-us/cybersecurity-101/threat-intelligence/indicators-of-compromise-ioc/