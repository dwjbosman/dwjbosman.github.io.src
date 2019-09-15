
For the past two years I have been working on a Railway embedded software device project. A huge difference with respect to earlier assignmeents was that the project involves a safety critical application. Developing software and hardware which will be used in a safety critical context poses a number of challenges. In many software projects quality control and testing are unfortunately still afterthoughts. It was a welcome change to experience that these topics can (and must) be first class citisens.

In order to deploy a safety critical product in a railway application (or for that matter other safety critical applications) the product will have to conform to several norms and standards. An external assessor will check that the product, it's documentation and development process all conform. In a safety criticel project the following four topics will get a lot of attention:

1. Role separation, independence
2. Traceability
4. Testing
3. Quality assurance, processes, evidence

It's these three topics that makes a safety critical product development different from more general software development. Of course it's not black and white, and non safety critical applications can be developed with these topics in mind as well. I'll now focus on each separate topic:

# Role separation

Three teams can be identified:
  * Development team
  * Verification team
  * Validation team

In our project the responsibilities were defined per team: the development team is responsible for requirements management, design, implementation and unit testing. The verification team is responsible for functional/performance testing, traceability review, verification of products (documentation, source code) delivered by the development team. The validation team is responsible for safety and availability aspects, final system testing and quality assurance.

The teams work independently. For example it is not allowed that a developer is also a functional tester. This ensures that if, a requirement is misunderstood and wrongly implemented, that the chancer are lower a tester will make the same misinterpretation. Thus the faulty implementation is found by a failed test. If the developers would test their own code then chances are that the test will also be faulty. 

The validation team is special in the sense that they are managed independently as well. So even under time pressure the validation team can focus on safety. 

Besides the teams checking each other there are also checks within the teams. Each product (documentation, code, tests) needs to be reviewed by another team member.


# Traceability

# Testing

# Validation, Quality assurance

# Tooling


 These reviews have a formal status, so it should be clear against which criteria 


Furthermore it is very important that every product is formally reviewed within a team. This ensures that
