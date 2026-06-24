---
title : "Intro to cyber deception : trapping the attacker"
header:
  overlay_image: /assets/images/lol.png
  side_image: /assets/images/CyberDeception/CyberPot2.png
date : 2026-06-23
toc: true
toc_sticky: true
categories :
    - DFIR
tags :
    - CyberDeception
excerpt : "An introduction to the art of luring attackers into traps to strengthen defenses and gather intelligence on their tactics."
image_preview : /assets/images/CyberDeception/CyberPot2.png
---

Traditional perimeter-based defences like firewalls and EDRs are no longer sufficient. Attackers have become experts at evading detection and bypassing these tools, which are now just a formality in their playbooks. What if, instead, we **intentionally forced attackers to make mistakes and leave digital footprints** ?


# Definitions

The majority or almost every company uses what we call a "passive defence". They try to **minimize the impact of hostile actions** — much like a wide-mesh fishing net that only catches the biggest or most careless fish. But when advanced attackers observe and adapt to this posture, they easily slip through the gaps or exploit the blind spots they have identified. At this point, **detection only happens after the damage is already done**.


However, organizations **should not have to trigger a full incident response cycle every time** a perimeter is breached. We need a paradigm shift. We need **active defence**. As the [Initial Access phase][initial_access] can easily be reached through **human attack vectors** (such as social engineering techniques), our aim is to gain as much time as possible before the enemy can complete their [objectives][objectives].

Once inside and during the first steps, the attacker is in an **environment they do not know and do not control**. Therefore, we can use **Cyber Deception**. It is an **extra layer of defence** that allows to wage a better defence by **slowing / deceiving / confusing the attacker to manipulate attack time**. It can help us reach the following result : 

**Detection time + Reaction time < Attack time**

>"You dictate the battlespace and the tempo, it's YOUR territory" - John Strand


<br>

# The OODA loop

## What is the OODA loop ?

How do we reach the previous equation ? By disrupting the attacker's OODA loop.
It is a decision-making framework that consists of four stages: **observation (O), orientation (O), decision (D), and action (A)**. It was developped by the US Air Force military strategist John Boyd. This iterative process helps individuals and organizations **make effective decisions in rapidly changing environments** by continuously cycling through these stages.

Many information-processing frameworks exist, and many of them follow some form of ‘action-learning cycle’ (ALC). 

![Action learning cycle](../../assets/images/CyberDeception/ACL.png)

Information processing in a competitive environment (here, attackers against defenders) is often referred as **“intelligence”**, and rivals can actively disrupt the adversary's intelligence. The OODA loop shows **multiple feedback loops** that can happen simultaneously and lead the decision-making process. "A competitor may rely more or less heavily on different sources of information flowing through different feedback loops."

Examples : 
- the player has experienced it before -> they rely more heavily on the ‘implicit guidance and control’ (IG&C) from the past experience ;
- the player faces an unfamiliar situation -> they rely more heavily on the new inputs from real-time observation.

So we must cycle through our own loop faster than the adversary. By forcing them to react to our moves, we effectively disrupt their OODA loop. We can note that this concept is one way among others to describe intuition and the decision-making process, but it turns out to be quite compatible with the [Cyber Kill Chain][ckc] we use in cybersecurity to understand the enemy's actions.


![OODA loop](../../assets/images/CyberDeception/OODALoop.png)


Every possible feedback loop flows through the Orientation state. A simple definition of Orientation might be ‘your perception of reality’ (dictated by different factors). **Orientation forms the core of the ‘cognitive engine’ that drives the OODA Loop.**

William Angerman proposes a conceptual framework for thinking about OODA Loops, which is summed up in three main ideas:
- Information = OODA Loop fuel
- Processing = OODA Loop activity
- A System (e.g. a human, a computer) = OODA Loop host

## Disrupt the attacker's OODA loop

Active defence and cyber deception play with / mislead the various feedback loops and end up with this result on the attack chain ; no techology can do that ! You can see the different effects it does to each step of the [Cyber Kill Chain][ckc] in the image below.

![Disrupted OODA loop](../../assets/images/CyberDeception/DisruptedLoop.png)

**Each mislead phase's result** directly feeds the 'Orientation' part of the loop, and therefore the **core of the attacker's strategy**. Their procedures become unsuited for your environment and have way less chances to succeed. It can even **discourage the attacker** facing a target (us) that is too "disturbing" to attack.



<br>

# Why these skills are critical

## You will be exploited

Current strategies are not working. Tools "improve" but they still end up failing against :
- 0-days
- Phishing / social engineering
- Advanced malware
- Supply chain infiltration
- Government backdoors

And above that, consider most good testing firms (with less capabilities than the attackers) are not thwarted by traditional defences (according to John Strand). We focus too much on prevention and NOT on detection and response.

> You should expect to be exploited because you will, and that is the reality.

Attackers get more brazen and perceive little risks since we do follow the rules and want to maintain entire Information systems. They do not. Attackers usually operate with specific objectives in mind. Unlike defenders who must secure everything, adversaries solely focus on the execution of their specific attack chain. In addition to that, their capabilities can be HUGE. Your enemies could be nation-states, organized crime, insiders... and they can have :
- unlimited resources
- never-ending exploits
- elaborate anonymization and C2
- immunity for prosecution (plausible deniability, laws not working...)
- highly motivated and conditioned teams (their “duty” !)

Actively disrupting attackers has become a necessity, moving away from the old model of passively waiting for alerts to trigger.

## A treasure for Cyber Threat Intelligence

Slowing and disrupting the attacker is a start, but we can go further by **finding out what they are seeking / information to better anticipate them**.

That is the more "CTI-ish" part of Cyber Deception. [CTI (Cyber Threat Intelligence)][CTI] is a must-have for a mature cyber security posture, and I understood it particularly after reading the famous reconstitution of military strategies named *"The Art of War", Sun Tzu*.You could see it as a very good way to **enhance the defenders' "Observe" step in the OODA loop**. I may write an article about the utility of CTI and its integration within a [Blue Team][Blue] in the future. Even a whole section of this blog is dedicated to CTI !

## Improvement of metrics

We can all agree on the fact that the ideal [SOC (Security Operation Center)][SOC] only detects true positives (detections that identify an ascertained malicious behaviour). Unfortunately, a 100% rate is impossible, but we can increase it with one of Cyber Deception's consequences : **High-Fidelity Alerts**.

We have not talked about the concrete ways to set up Cyber Deception yet, but at this point, you already understand that this will mainly look like a **great variety of traps**.  Of course, these assets aren't deployed randomly; they are strategically placed so that they can **only be triggered by malicious activity**. It means that each trap's detection would 100% of the time be a true positive (if well placed). This **reduces the [Mean-Time-To-Detect (MTTD)][MTTD]**, and allows to  respond earlier and better after an intrusion. This also reduces the workload of the triage analysts who will be given artefacts in the early stages of the attacks and spend time on alerts that truly matter.


<br>

# The implementation and running costs

Organizations are often **hesitant to adopt cyber deception** due to the misconception that it requires heavy, complex infrastructure. In reality, deception solutions vary **widely based on their level of interaction** : 
- Low-Interaction : it is easy to deploy, poses no risk, and is ideal for detecting the first attack steps (it could be a fake open port, a canary, etc...).
- High-Interaction : it is hard to maintain, but allows to observe the attacker in real time with all of their procedures subtilities (it could be an isolated vulnerable Windows server).

Once deployed, security teams must dedicate time to mapping out these assets, understanding their objectives, and defining response playbooks. To maintain effectiveness, regular inventory checks and tabletop exercises are highly recommended.

**Info Notice:** We will experiment table top exercises in the future on this blog, and specifically using the free BlackHills Information Security card game named [Backdoors and Breaches][BAB]
{: .notice--info}

More specific examples of diverse Cyber Deception implementations for "annoyance" or "attribution" against attackers will be discussed in future articles !

<br>

# Cyberdeception and legal matters

As we said earlier, we do follow the rules, but unfortunately, there is currently **limited established case law regarding active defence**, which leaves room for **legal ambiguity or misinterpretation**. There is still a basic list of instructions we can follow to respect the law : 
- "Hack back" is forbidden ;
- make attackers come to you first ;
- document what is implemented and done ;
- prevent collateral damage (make traps only accessible to attackers) ;
- use warnings and terms of use ;
- no trap should cause a certain degree of harm (this one is to be nuanced, because some implementations can cause teh destruction of the attacking infrastructures) ;
- be sure to respect GDPR in case an employee triggers a trap.

In general, we have to make sure to have a **solid legal footing** and to maintain **high ethical standards (consult legal team / HR / upper management)**.

<br>

# Conclusion

**Thank you** for reading my introduction to Cyber Deception. I hope you understand what Cyber Deception is, how it impacts attackers, its value and how it can be done while respecting the law.
This article has greatly been based on the free 16-hour webinar *Active Defence & Cyber Deception* by **John Strand**, huge credits to him ! (available on the official channel linked below). I advise you to attend his course if you can, it is a very different experience from reading a blog.
The **next article** about this subject will talk about **concrete solutions** that exist to annoy and slow the attacker.

This article is my interpretation of the different sources I found, I could make mistakes, this is just a node among others in the vast world of Internet. As I am still learning, feel free to reach me by email if you want to discuss further or if you want to suggest any correction supported by a reliable source.

<br>
*Sources :*
<br>*https://en.wikipedia.org/wiki/OODA_loop*
<br>*https://thedecisionlab.com/reference-guide/computer-science/the-ooda-loop*
<br>*John Strand's 16-hour course attended in 2025, but you can find recorded sessions from the official channel : https://www.youtube.com/@AntisyphonTraining*


[initial_access]: https://attack.mitre.org/tactics/TA0001/
[objectives]: https://attack.mitre.org/tactics/TA0040/
[ckc]: https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html&ved=2ahUKEwifns_Myp-VAxWLK_sDHbzmET0QFnoECCEQAQ&usg=AOvVaw3yTEs64d_BErwyw8HkXFAl
[CTI]: https://www.intrinsec.com/en/comprendre-la-cyber-threat-intelligence-cti/
[SOC]: https://www.sekoia.com/glossary/soc
[Blue]: https://www.sentinelone.com/cybersecurity-101/cybersecurity/what-is-a-blue-team/
[MTTD]: https://www.splunk.com/en_us/blog/learn/mean-time-to-detect-mttd.html
[BAB]: https://www.blackhillsinfosec.com/tools/backdoorsandbreaches/