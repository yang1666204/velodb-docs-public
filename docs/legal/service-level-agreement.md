---
{
    "title": "VeloDB Cloud Service Level Agreement (SLA)",
    "description": "VeloDB Cloud SLA: uptime guarantee, definitions, compensation terms for service interruptions. Understand your rights for cloud reliability.",
}
---

# VeloDB Cloud Service Level Agreement (SLA)

**Effective Date:** December 6, 2023

This Service Level Agreement for VeloDB Cloud Service ("SLA") specifies the availability level indicators of VeloDB cloud-native real-time data warehouse services ("VeloDB Cloud") provided by VELODB TECHNOLOGY INTERNATIONAL PTE. LTD. and its U.S. subsidiary VELODB INC. ("VeloDB") to the users ("user", or "you") and the terms and conditions of the relevant compensation.

**1. Definitions**

**1.1 Service Cycle**

A service cycle is a calendar month. If you have used a VeloDB Cloud cluster for less than one month, the service cycle will be the accumulated time of use of that cluster.

**1.2 Service Cycle Calculated in Minutes**

The total time of a Service Cycle calculated in minutes equals the number of days of the Service Cycle × 24 (hours) × 60 (minutes). 

**1.3 Service Downtime**

When within five minutes, due to the reasons of VeloDB Cloud, all the customer's attempts to connect or send requests to the cluster fail, it is deemed that the cluster service is unavailable within the five minutes. Except for the circumstances stipulated in the exemption clause in Article 4 of this Agreement.

**1.4 Service Downtime Calculated in Minutes within a Service Cycle**

Within a Service Cycle, the Service Downtime minutes of a cluster equals the total Service Downtime calculated in minutes of that cluster.

**1.5 Monthly Service Fee**

“Monthly Service Fee” means the total charges paid by you for a single VeloDB Cloud cluster  in one billing month. For the upfront lump sum payment paid by you for the Service, Monthly Service Fee equals to the lump sum payment divided by the number of months of the Service covered by such payment.Monthly Service Fee shall exclude the portion deducted by coupons or vouchers.

<br />

**2. Service Availability**

**2.1 Calculation of Service Availability**

Service availability of a single cluster is calculated as follows:

Service Availability = (Service Cycle Calculated in Minutes - Service Downtime Calculated in Minutes within a Service Cycle) / Service Cycle Calculated in Minutes × 100%

**2.2 Service Availability Guarantee**

The Service Availability of VeloDB Cloud clusters provided by VeloDB will be no less than 99.9%. If the Service Availability fails to meet the aforementioned standard, you shall be entitled to compensations as described in Section 3 below. 

<br />

**3. Service Compensation**

**3.1 Standards of Compensation**

If the Service Availability of a VeloDB Cloud cluster for a Service Cycle fails to meet the standard, you shall be entitled to compensations made in the form of voucher as described in the table below. Such vouchers can only be used to purchase VeloDB Cloud services. The aggregated amount of vouchers shall not exceed 50% of the applicable Monthly Service Fee paid by you for such Service Cycle (Monthly Service Fee referred herein shall exclude the portion deducted by vouchers).

| **Service Availability for a Service Cycle**         | **Value of Compensation Voucher** |
| ------------------------------ | -------------------------- |
| Less than 99.9% but equal to or greater than 99.0% | 10% of the monthly service fee       |
| Less than 99.0% but equal to or greater than 95.0% | 25% of the monthly service fee       |
| Less than 95%          | 50% of the monthly service fee       |

**3.2 Time Limit for Compensation Application**

If the Service Availability for a Service Cycle fails to meet the standard, you may apply for compensation after the fifth working day of the month immediately following such Service Cycle. **You should apply for such compensation no later than two calendar months following the expiry of the applicable Service Cycle in which the Service Availability fails to meet the standard.**

<br />

**4. SLA Exclusions**

**If the Service is unavailable due to any of the following reasons, the corresponding unavailability period shall not be counted towards Service Downtime, and is not eligible for compensation by VeloDB Cloud, and VeloDB will not be held liable to you:**

（1）Any system maintenance with prior notice by VeloDB to you, including but not limited to system cutover, maintenance, upgrade, failure simulation test;

（2）Any failure attributable to networks, devices, or configuration changes beyond the scope of VeloDB;

（3）Any stopping/stopped/starting/restarting time you spend during your use of VeloDB Cloud clusters;

（4）Any failure due to cyber attacks against your applications or data;

（5）Any failure due to your mal-operation in maintenance or authorization, including but not limited to loss or leak of password and data;

（6）Any failure attributable to your negligence or your authorized operations;

（7）Any cluster failure due to insufficient physical capacity of the storage and computing of your choice to satisfy the de facto demands;

（8）Any failure due to noncompliance with the guidance for using VeloDB Cloud;

（9）Any cluster for testing which is not advisable for use in production (e.g. the trial cluster) is beyond the scope of this SLA;

（10）Any failure due to force majeure;

（11）Any other circumstances in which VeloDB Cloud will be exempted or released from its liabilities (for compensation or otherwise) according to relevant laws, regulations, agreements or rules, or any terms of services, rules or guidelines published by VeloDB Cloud separately.

 <br />

**5. Additional Terms**

VeloDB reserves the right to amend the provisions of this SLA as appropriate or necessary. VeloDB will notify you of such amendments by giving thirty days prior notice in the form of website announcement or email. If you disagree with such revisions made by VeloDB to this SLA, you have the right to stop using the VeloDB Cloud service. Your continued use of the service after the publication of the amended SLA shall be deemed as your acceptance of the amended SLA.
