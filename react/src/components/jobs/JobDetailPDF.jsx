import React from "react";
import PropTypes from "prop-types";
import {
  Page,
  Font,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { PdfTitle } from "../pdf/examplePdf/miscComponents/PdfTitle";

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  textCenter: {
    textAlign: "center",
    marginBottom: 5,
    fontSize: 16,
  },
  textCenterSmall: {
    textAlign: "center",
    marginBottom: 2,
    marginTop: 2,
    fontSize: 12,
  },
  row: {
    flexGrow: 1,
    flexDirection: "row",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Oswald",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
    fontFamily: "Oswald",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  textSmall: {
    margin: 12,
    fontSize: 12,
    textAlign: "justify",
    fontFamily: "Times-Roman",
    fontWeight: "thin",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const JobDetailPDF = (props) => {
  const jobData = props.data;
  const jobPostDate = jobData.dateCreated
    ? new Date(jobData.dateCreated).toDateString()
    : "Not Available";
  const jobUpdatedDate = jobData.dateModified
    ? new Date(jobData.dateModified).toDateString()
    : "Not Available";

  new Date(jobData.dateModified);
  const postedBy = `${jobData.createdBy.firstName} ${jobData.createdBy.lastName}`;
  return (
    <Document>
      <Page size="A4" style={styles.body}>
        <PdfTitle />
        <Text style={styles.textCenter}>Job Title: {jobData.title}</Text>
        <Text style={styles.textCenterSmall}>
          {jobData.isActive && "This Job is currently active."}
        </Text>

        <View style={styles.row}>
          <View style={styles.body}>
            <Text style={styles.text}>
              Job Description: {jobData.description}
            </Text>
            <Text style={styles.text}>
              Job Requirements: {jobData.requirements}
            </Text>
            <Text style={styles.text}>Job Type: {jobData.jobType.name}</Text>

            <Text style={styles.text}>Posted By: {postedBy}</Text>
            <Text style={styles.text}>
              Location:{" "}
              {
                (jobData.jobLocation.city,
                jobData.jobLocation.state.name + " " + jobData.jobLocation.zip)
              }
            </Text>
            <Text style={styles.textSmall}>Date Posted: {jobPostDate}</Text>
            <Text style={styles.textSmall}>Last Updated: {jobUpdatedDate}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

JobDetailPDF.propTypes = {
  data: PropTypes.shape({
    createdBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    jobType: PropTypes.shape({
      name: PropTypes.string,
    }),
    jobLocation: PropTypes.shape({
      city: PropTypes.string,
      state: PropTypes.object,
      zip: PropTypes.string,
    }),
    dateCreated: PropTypes.string,
    dateModified: PropTypes.string,
    title: PropTypes.string,
    isActive: PropTypes.bool,
    description: PropTypes.string,
    requirements: PropTypes.string,
  }),
};

export default JobDetailPDF;
