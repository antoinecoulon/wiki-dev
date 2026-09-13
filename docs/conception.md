# Wiki-dev - Dossier de conception

> Application facilement accessible permettant de prendre et conserver des notes de développement, de suivre des projets, d'organiser son travail et ses pensées.

## Contexte

J'utilise au quotidien l'application Notion, qui me permet de prendre des notes sur mes projets ou sur des technologies, que ce soit en environnement professionnel ou personnel. L'application me permet aussi de suivre mes projets avec des kanban, tableaux... L'édition et l'organisation est simple et facile. Cependant l'application me pose de gros problèmes d'accessibilité: elle a tendance à être lentre et à buguer. Surtout, elle est quasiment innutilisable derrière le proxy de mon environnement professionnel.

Je souhaite développer une application qui comprend les fonctionnalités dont j'ai réellement besoin, pas plus ni moins. Qu'elle soit accessible rapidement et simplement quand je développe, en entreprise ou chez moi. Elle doit me permettre une utilisation proche de Notion, avec seulement les fonctionnalités que je vais utiliser. 

Ce que je ne veux pas: j'ai développé dev-docs, une application web qui était accessible facilement de partout et dans laquelle je pouvais stocker du savoir de développement. Elle ne me permettait pas de suivre mes projets facilement, et il fallait que je clone le projet pour y coller des fichiers .md pour créer des pages ou pour les modifier. Ce n'était pas pratique.

## Stack

Frontend: Nuxt4/Vue3 + NuxtUi
BFF Nuxt avec Backend C# OU Backend Nuxt OU autre (cloud, technologie inconnue, etc) ??? -> à déterminer

## CLAUDE

On va commencer par réfléchir à l'architecture et à une stack qui collerait facilement, en prenant en compte mes besoins.

Actuellement, rien n'est figé. Je pars naturellement vers Nuxt/C# car ce sont des technologies avec lesquelles je travaille tous les jours en entreprise, mais je ne connais pas les alternatives et/ou nouveautés, je souhaite explorer ce qui existe et ce qui est possible tant que cela répond à mes besoins.

On posera les bases dans ce dossier avant de mettre en place notre environnement de travail.